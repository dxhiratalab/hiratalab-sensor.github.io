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
            this.status = data.status === 'success' ? '取得成功' : '取得失敗';
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