import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  // 检查是否从旧域名访问
  const host = context.request.headers.get('host');
  if (host && (host.includes('lmxhl.top') || host.includes('www.lmxhl.top'))) {
    // 构建新域名的 URL
    const url = new URL(context.request.url);
    url.host = '240900.xyz';
    
    // 返回重定向响应，提示用户更新域名
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>域名更新通知</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 600px;
            text-align: center;
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .new-domain {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
          }
          .expiry-date {
            color: #dc3545;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #0069d9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>域名更新通知</h1>
          <p>您好！我们的网站域名已更新为：</p>
          <div class="new-domain">240900.xyz</div>
          <p>请尽快更新您的书签和链接，旧域名 <span class="expiry-date">lmxhl.top</span> 将于 2026-08-12 过期。</p>
          <p>点击下方按钮访问新域名：</p>
          <a href="${url.toString()}" class="button">访问新域名</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 301,
        headers: {
          'Content-Type': 'text/html',
          'Location': url.toString(),
        },
      }
    );
  }
  
  // 继续处理请求
  return next();
});
