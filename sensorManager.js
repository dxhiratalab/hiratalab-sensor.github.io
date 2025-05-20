class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.status = '未取得';
        this.data = null;
    }

    async fetchSensorStatus() {
        try {
            this.status = '取得中...';
            const response = await fetch(this.gasUrl);
            const data = await response.json();
            this.data = data;
            this.status = '取得成功';
            return data;
        } catch (error) {
            console.error('エラー:', error);
            this.status = '取得失敗';
            throw error;
        }
    }

    getStatus() {
        return this.status;
    }

    getData() {
        return this.data;
    }

    // データを整形して返すメソッド
    formatData() {
        if (!this.data) return null;
        
        if (Array.isArray(this.data)) {
            return this.data.map(item => ({
                ...item,
                formatted: true
            }));
        }
        
        return {
            ...this.data,
            formatted: true
        };
    }
}

// 使用例:
// const sensorManager = new SensorManager('YOUR_GAS_SCRIPT_URL');
// 
// // データを取得する
// await sensorManager.fetchSensorStatus();
// 
// // 状態を確認
// console.log(sensorManager.getStatus());
// 
// // データを取得
// console.log(sensorManager.getData());
// 
// // 整形されたデータを取得
// console.log(sensorManager.formatData());

// モジュールとしてエクスポート
export default SensorManager; 