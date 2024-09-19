const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async (req, res) => {
  console.log('Received upload request');

  if (req.method !== 'POST') {
    console.log('Received non-POST request');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No file found in request body' });
    }

    const form = new FormData();
    form.append('file', Buffer.from(file.data), {
      filename: file.name,
      contentType: file.type,
    });

    const headers = {
      ...form.getHeaders(),
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'Cache-Control': 'no-cache',
      'Host': 'pic-up.meituan.com',
      'Origin': 'https://czz.meituan.com',
      'Pragma': 'no-cache',
      'Referer': 'https://czz.meituan.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'client-id': 'p5gfsvmw6qnwc45n000000000025bbf1',
      'token': process.env.MEITUAN_TOKEN
    };

    console.log('Sending request to Meituan API');
    const response = await fetch('https://pic-up.meituan.com/extrastorage/new/video?isHttps=true', {
      method: 'POST',
      body: form,
      headers: headers,
    });

    const data = await response.json();
    console.log('Received response from Meituan API:', data);

    if (data.success === true) {
      return res.json({
        Jobs: data.data.originalLink,
        Name: data.data.originalFileName,
        os: 'node-oss.zai1.com'
      });
    } else {
      console.error('Upload failed:', data);
      return res.status(400).json({ error: 'Upload failed', details: data });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};