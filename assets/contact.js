document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.js-contact-form');
  if (!form) return;

  const BACKEND_ORIGIN = 'https://bds-site--bdssite-5fac1.europe-west4.hosted.app';
  const service = form.querySelector('#service');
  const websiteWrap = form.querySelector('#website-field');
  const website = form.querySelector('#website');
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-form-status');
  const auditService = 'Free Website and SEO Audit';

  const setAuditMode = () => {
    const enabled = service?.value === auditService;
    websiteWrap?.toggleAttribute('hidden', !enabled);
    if (website) {
      website.required = enabled;
      website.disabled = !enabled;
      if (!enabled) website.value = '';
    }
    if (submit) submit.textContent = enabled ? 'Run My Free Audit' : 'Send Enquiry';
  };

  service?.addEventListener('change', setAuditMode);
  setAuditMode();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const isAudit = data.get('service') === auditService;
    const endpoint = isAudit ? '/api/audit' : '/api/contact';
    const payload = isAudit
      ? {
          name: String(data.get('name') || '').trim(),
          email: String(data.get('email') || '').trim(),
          phone: String(data.get('phone') || '').trim(),
          website: String(data.get('website') || '').trim(),
          businessName: String(data.get('company') || '').trim() || 'Website Audit Client',
        }
      : {
          name: String(data.get('name') || '').trim(),
          email: String(data.get('email') || '').trim(),
          company: String(data.get('company') || '').trim(),
          service: String(data.get('service') || '').trim(),
          message: String(data.get('message') || '').trim(),
          website: String(data.get('website') || '').trim(),
        };

    status?.classList.remove('is-error');
    if (status) {
      status.textContent = isAudit
        ? 'Running your website audit. This can take up to a minute…'
        : 'Sending your enquiry…';
    }
    submit?.setAttribute('disabled', '');

    try {
      const response = await fetch(`${BACKEND_ORIGIN}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');

      if (isAudit && result.reportId) {
        window.location.assign(`${BACKEND_ORIGIN}/audit/${encodeURIComponent(result.reportId)}`);
        return;
      }

      form.reset();
      setAuditMode();
      if (status) status.textContent = 'Enquiry sent successfully. Please check your inbox for confirmation.';
    } catch (error) {
      if (status) {
        status.classList.add('is-error');
        status.textContent = error instanceof Error ? error.message : 'Unable to submit. Please call 07843 969254.';
      }
    } finally {
      submit?.removeAttribute('disabled');
      if (submit) submit.textContent = service?.value === auditService ? 'Run My Free Audit' : 'Send Enquiry';
    }
  });
});
