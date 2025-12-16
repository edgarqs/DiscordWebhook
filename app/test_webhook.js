const testWebhook = 'https://discord.com/api/webhooks/1450047832521183295/feZEtk4l5_4gQl1D5FI5U4PqvVMbSukxuqDlNIrktK0U3DZwJ9oR8wKMdTt1GXP1G3fy';

fetch('/webhooks/validate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    },
    body: JSON.stringify({ webhook_url: testWebhook }),
})
    .then(res => res.json())
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Error:', err));
