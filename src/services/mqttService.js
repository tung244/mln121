import mqtt from 'mqtt';
import mqttConfig from '../config/mqttConfig';

let client = null;

// Hàm khởi tạo kết nối MQTT
export const connectMqtt = () => {
  // HiveMQ Cloud WebSocket URL BẮT BUỘC phải có path "/mqtt" ở cuối
  // wss://host:8884/mqtt  ← đúng
  // wss://host:8884       ← sai, broker sẽ đóng handshake ngay
  const connectUrl = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}/mqtt`;

  client = mqtt.connect(connectUrl, {
    clientId: 'innovation_cube_' + Math.random().toString(16).substring(2, 8),
    username: mqttConfig.username,
    password: mqttConfig.password,
    clean: true,
    connectTimeout: 10000,
    reconnectPeriod: 3000,
    keepalive: 60,
  });

  client.on('connect', () => {
    console.log('✅ Đã kết nối MQTT Broker thành công!');
    // Tự động subscribe khi kết nối
    client.subscribe(mqttConfig.topic, (err) => {
      if (!err) {
        console.log(`📡 Đã subscribe vào topic: ${mqttConfig.topic}`);
      }
    });
  });

  client.on('error', (err) => {
    // Không gọi client.end() ở đây để mqtt.js tự reconnect qua reconnectPeriod
    console.error('❌ Lỗi kết nối MQTT:', err.message || err);
  });

  // Có thể bắt thêm sự kiện nhận tin nhắn (nếu có subcribe)
  client.on('message', (topic, message) => {
    console.log(`📥 Nhận được từ topic [${topic}]:`, message.toString());
  });

  return client;
};

// Hàm gửi (publish) dữ liệu
export const publishMessage = (payload = mqttConfig.defaultPayload, topic = mqttConfig.topic) => {
  if (!client || !client.connected) {
    console.warn('⚠️ Cảnh báo: MQTT client chưa kết nối. Không thể gửi.');
    return;
  }

  // Chuyển object payload thành chuỗi JSON (như {"msgs": "OFF"})
  const messageString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  client.publish(topic, messageString, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error('❌ Lỗi khi publish dữ liệu:', error);
    } else {
      console.log(`🚀 Đã publish thành công [${topic}]:`, messageString);
    }
  });
};

// Hàm gửi tín hiệu khi chuyển scene
export const publishSceneSignal = (sceneName) => {
  if (!client || !client.connected) {
    console.warn('⚠️ Cảnh báo: MQTT client chưa kết nối. Không thể gửi tín hiệu scene.');
    return;
  }

  const messageValue = mqttConfig.sceneMessages[sceneName];
  if (!messageValue) {
    console.warn(`⚠️ Không tìm thấy message cho scene: ${sceneName}`);
    return;
  }

  const payload = { msg: messageValue };
  const messageString = JSON.stringify(payload);

  client.publish(mqttConfig.topic, messageString, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(`❌ Lỗi khi publish scene signal:`, error);
    } else {
      console.log(`🚀 Đã gửi tín hiệu scene [${mqttConfig.topic}]:`, messageString);
    }
  });
};

// Hàm ngắt kết nối
export const disconnectMqtt = () => {
  if (client) {
    client.end();
    console.log('🔻 Đã ngắt kết nối MQTT');
  }
};
