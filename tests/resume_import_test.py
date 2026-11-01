"""Run against the local server: python3 tests/resume_import_test.py"""
import io
import zipfile
from playwright.sync_api import sync_playwright

TEXT = 'Alex Taylor\nHeadline: Data Analyst\nLocation: Pune\nalex@example.com\nSummary\nExperienced analyst\nExperience\nAnalyst at Example\nEducation\nBSc Statistics\nSkills\nPython, SQL'
def docx():
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>')
        z.writestr('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join('<w:p><w:r><w:t>'+s+'</w:t></w:r></w:p>' for s in TEXT.splitlines())+'</w:body></w:document>')
    return data.getvalue()
def pdf():
    stream = 'BT /F1 12 Tf 50 750 Td 16 TL '+ ' T* '.join('('+line+') Tj' for line in TEXT.splitlines())+' ET'
    objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',f'<< /Length {len(stream)} >>\nstream\n{stream}\nendstream']
    data = b'%PDF-1.4\n'; offsets = [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(data)); data += f'{i} 0 obj\n{obj}\nendobj\n'.encode()
    start = len(data)
    data += b'xref\n0 6\n0000000000 65535 f \n'+b''.join(f'{o:010} 00000 n \n'.encode() for o in offsets[1:])
    return data+f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{start}\n%%EOF'.encode()
MOCK = """window.saved=[]; window.failSave=false; window.CareerCloud={configured:true,user:{uid:'test-user'},read:async n=>n==='profile'?{fullName:'Original',preferredRoles:'Keep me'}:n==='jobs'?[{id:'job-1',title:'Existing job',company:'Example',status:'Saved'}]:{summary:'Existing summary'},write:async(n,v)=>saved.push({n,v}),importResume:async(p,r,uid)=>{if(failSave)throw Error('Mock permission denied');if(CareerCloud.user?.uid!==uid)throw Error('Sign in required');saved.push({p,r,uid})}}; setTimeout(()=>window.dispatchEvent(new CustomEvent('career-auth',{detail:{configured:true,user:CareerCloud.user}})),100);"""
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context=browser.new_context(service_workers='block')
    context.route('https://**/*',lambda route:route.abort())
    context.route('**/cloud.js',lambda route:route.fulfill(body=MOCK,content_type='text/javascript'))
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8000/'); page.evaluate("window.dispatchEvent(new CustomEvent('career-auth',{detail:{configured:true,user:CareerCloud.user}}))"); page.locator('[data-view=resume]').click()
    def upload(name,data):
        page.locator('[data-import-resume]').click()
        page.locator('#resumeFile').set_input_files({'name':name,'mimeType':'application/octet-stream','buffer':data})
    def ready():
        page.locator('#importApproval').wait_for()
    for name,data in [('resume.docx',docx()),('resume.pdf',pdf())]:
        upload(name,data); ready()
        assert page.locator('[name=value-fullName]').input_value()=='Alex Taylor'
        assert 'Python' in page.locator('[name=value-skills]').input_value()
        assert page.evaluate('saved.length')==0
        page.locator('#cancelImport').click()
    upload('bad.txt',b'bad'); page.get_by_text('Could not import: Only PDF and DOCX files are supported.').wait_for(); page.locator('#cancelImport').click()
    upload('bad.pdf',b'not PDF'); page.get_by_text('Could not import: This file is not a valid PDF.').wait_for(); page.locator('#cancelImport').click()
    upload('resume.docx',docx()); ready()
    page.locator('[name=value-fullName]').fill('Reviewed Name')
    page.locator('[name=select-summary]').uncheck()
    page.locator('#importApproval button').click(); assert page.evaluate('saved.length')==0
    page.locator('#approveImport').check(); page.evaluate('failSave=true')
    page.locator('#importApproval button').click(); page.get_by_text('Import was not saved: Mock permission denied').wait_for()
    assert page.evaluate('saved.length')==0
    page.evaluate('failSave=false'); page.locator('#importApproval button').click()
    page.wait_for_function('saved.length===1')
    saved=page.evaluate('saved[0]')
    assert saved['p']['fullName']=='Reviewed Name' and saved['r']['name']=='Reviewed Name'
    assert saved['p']['preferredRoles']=='Keep me' and saved['r']['summary']=='Existing summary'
    assert saved['uid']=='test-user'
    page.locator('[data-view=tracker]').click(); assert page.get_by_text('Existing job',exact=True).is_visible()
    page.locator('[data-view=resume]').click(); upload('resume.docx',docx()); ready()
    page.evaluate("CareerCloud.user=null;window.dispatchEvent(new CustomEvent('career-auth',{detail:{configured:true,user:null}}))")
    assert not page.locator('#resumeImportDialog').is_visible()
    assert page.locator('#authGate').is_visible()
    assert not errors, errors
    print('PASS: real PDF/DOCX extraction, mapping, cancellation, validation, explicit approval, save failure/retry, preservation, job tracker, auth-change cleanup; no browser errors')
    browser.close()
