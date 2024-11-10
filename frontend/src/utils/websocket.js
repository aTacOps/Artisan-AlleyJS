class WebSocketClient {
    constructor(roomName, onMessageCallback) {
      this.roomName = roomName;
      this.socket = null;
      this.onMessageCallback = onMessageCallback;
    }
  
    connect() {
      const url = `ws://localhost:8000/ws/chat/${this.roomName}/`; // Replace with your WebSocket endpoint
      this.socket = new WebSocket(url);
  
      // Handle incoming messages
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      };
  
      // Handle connection close
      this.socket.onclose = () => {
        console.log("WebSocket closed. Reconnecting...");
        setTimeout(() => this.connect(), 3000); // Attempt to reconnect after 3 seconds
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }
  
  export default WebSocketClient;
  