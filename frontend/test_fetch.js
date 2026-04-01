fetch('https://image.pollinations.ai/prompt/test?width=400&height=400&nologo=true&seed=123')
    .then(res => console.log(res.status, res.headers.get('content-type')))
    .catch(err => console.error(err));
