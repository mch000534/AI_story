/**
 * AI Streaming WebSocket Client
 * 處理 AI 生成的即時串流顯示
 */

type StreamEventType = 'token' | 'complete' | 'error';

interface StreamMessage {
    type: StreamEventType;
    content?: string;
    total_tokens?: number;
    message?: string;
}

interface StreamCallbacks {
    onToken: (token: string) => void;
    onComplete: (fullContent: string) => void;
    onError: (error: string) => void;
}

export class AIStreamClient {
    private ws: WebSocket | null = null;
    private callbacks: StreamCallbacks;
    private fullContent: string = '';
    private connectUrl: string;

    constructor(connectUrl: string, callbacks: StreamCallbacks) {
        this.connectUrl = connectUrl.replace(/^http/, 'ws');
        this.callbacks = callbacks;
    }

    /**
     * 開始連接並傳送初始化數據
     */
    public connect() {
        try {
            this.ws = new WebSocket(this.connectUrl);
            this.fullContent = '';

            this.ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    // 假設後端直接傳送純文本或 JSON
                    // 如果是 SSE 格式包裝在 WS 中，需要在此解析
                    // 這裡假設後端回傳的是 JSON 格式的 StreamMessage
                    const data: StreamMessage = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    // 如果不是 JSON，可能直接是 token 字符串?
                    // 這裡依照 spec.md 中的設計：{"type": "token", "content": "..."}
                    console.error('Failed to parse WebSocket message:', event.data);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.callbacks.onError('WebSocket 連線錯誤');
            };

            this.ws.onclose = () => {
                console.log('WebSocket Disconnected');
            };
        } catch (err) {
            console.error('Connection failed:', err);
            this.callbacks.onError('無法建立連線');
        }
    }

    private handleMessage(message: StreamMessage) {
        switch (message.type) {
            case 'token':
                if (message.content) {
                    this.fullContent += message.content;
                    this.callbacks.onToken(message.content);
                }
                break;
            case 'complete':
                this.callbacks.onComplete(this.fullContent);
                this.disconnect();
                break;
            case 'error':
                this.callbacks.onError(message.message || '生成過程中發生錯誤');
                this.disconnect();
                break;
        }
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

/**
 * 輔助函數：將 API 路徑轉換為 WebSocket URL
 */
export const getWebSocketUrl = (path: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // 將 http/https 替換為 ws/wss
    const wsBase = baseUrl.replace(/^http/, 'ws');
    // 移除 path 前面的 slash 避免雙重 slash (如果 baseUrl 有結尾 slash)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // 確保正確連接
    return `${wsBase}/${cleanPath}`;
};
