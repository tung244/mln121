const mqttConfig = {
  // mqtts (port 8883) = raw TCP+TLS → chỉ dùng được trên Node.js / ESP32 / app native
  // wss   (port 8884) = MQTT qua WebSocket Secure → bắt buộc phải dùng trên trình duyệt web
  protocol: 'wss',
  host: '79976e79f4664dbbbd83b89cdd6253ca.s1.eu.hivemq.cloud',
  port: 8884,
  username: 'mln121',
  password: 'Mln12123456',
  topic: 'esp32',
  defaultPayload: {
    msgs: 'OFF',
  },
  // Scene messages
  sceneMessages: {
    '9': 'DH6',
    '11': 'DH8',
    '14': 'DH10',
  },
};

export default mqttConfig;
