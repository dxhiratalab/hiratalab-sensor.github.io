class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.status = '未取得';
        this.freeSensors = null;  // 空きセンサー情報を保存
    }

    async fetchSensorStatus() {
        try {
            const statusElement = document.getElementById('status');
                
            statusElement.textContent = '状態: 取得中...';
            this.status = '取得中...';
            console.log('データ取得開始:', this.gasUrl);  // デバッグ用

            const response = await fetch(this.gasUrl);
            const data = await response.json();
            
            // 受け取ったデータをログ出力
            console.log('GASから受け取ったデータ:', data);
            
            this.freeSensors = data;  // 空きセンサー情報を保存
            this.status = '取得成功';
            statusElement.textContent = '状態: 取得成功';
            
            return data;
        } catch (error) {
            console.error('エラー:', error);
            this.status = '取得失敗';
            throw error;
        }
    }

    // 空きセンサーの一覧を取得
    getFreeSensors() {
        return this.freeSensors;
    }

    // 特定のタイプの空きセンサーを取得
    getFreeSensorsByType(type) {
        if (!this.freeSensors) return [];
        return this.freeSensors.filter(sensor => sensor.type === type);
    }

    // 特定のモデルの空きセンサーを取得
    getFreeSensorsByModel(model) {
        if (!this.freeSensors) return [];
        return this.freeSensors.filter(sensor => sensor.model === model);
    }

    getStatus() {
        return this.status;
    }
}

// ブラウザ環境でも使えるようにグローバルに公開
if (typeof window !== 'undefined') {
    window.SensorManager = SensorManager;
}