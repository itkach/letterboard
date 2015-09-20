import qrcode from 'yaqrcode';

onmessage = (e) => {
  const text = e.data,
        imgData = qrcode(text);
  postMessage(imgData);
};
