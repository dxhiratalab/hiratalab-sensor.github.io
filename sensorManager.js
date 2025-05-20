// センサーのデータを取得するためのクラス

class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.status = '未取得';
        this.data = null;
        this.sensorDetails = null;  // センサー詳細を保存するプロパティを追加
    }

    async fetchSensorStatus() {
        try {
            //取得中という言葉を表示する
            const statusElement = document.getElementById('status');
            statusElement.textContent = '取得中...';

            this.status = '取得中...';
            //statusElement.textContent = '取得中...';
            const response = await fetch(this.gasUrl);
            
            const data = await response.json();
            
            // 受け取ったデータをログ出力して確認
            console.log('Received data:', data);
            
            this.data = data;
            // GASから返ってきたallSensorDetailsを保存
            this.sensorDetails = data;  // この時点でallSensorDetailsが入っている
            
            this.status = '取得成功';
        
            return data;
        } catch (error) {
            console.error('エラー:', error);
            this.status = '取得失敗';
            throw error;
        }
    }

    // センサー詳細を取得するメソッドを追加
    getSensorDetails() {

        return this.sensorDetails;
    }

    // 特定のタイプと型番のセンサーIDを取得するメソッドを追加
    getSpecificSensorIds(type, model) {
        if (!this.sensorDetails) return [];
        
        return this.sensorDetails
            .filter(sensor => 
                sensor.type === type && 
                sensor.model === model
            )
            .map(sensor => sensor.id);
    }

    // WebCam C920nのIDを取得する専用メソッド（例として）
    getWebCamC920nIds() {
        return this.getSpecificSensorIds('CAMERA', 'WebCam C920n');
    }

    getStatus() {
        return this.status;
    }

    getData() {
        return this.data;
    }

    formatData() {
        if (!this.data || !this.data.sensors) return null;
        
        // センサータイプごとにグループ化
        const groupedSensors = this.data.sensors.reduce((acc, sensor) => {
            if (!acc[sensor.type]) {
                acc[sensor.type] = [];
            }
            acc[sensor.type].push(sensor);
            return acc;
        }, {});

        return {
            summary: {
                total: this.data.sensors.length,
                updated: this.data.updated,
                types: Object.keys(groupedSensors).length
            },
            sensorsByType: groupedSensors
        };
    }
}

// ブラウザ環境でも使えるようにグローバルに公開
if (typeof window !== 'undefined') {
    window.SensorManager = SensorManager;
}