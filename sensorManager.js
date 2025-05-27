class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.fetchStatus = '未取得';
    }

    async _fetchSensorData(params = {}) {
        const paramSeparator = this.gasUrl.includes('?') ? '&' : '?';
        let fetchUrl = this.gasUrl;
        
        if (Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams(params);
            fetchUrl += paramSeparator + queryParams.toString();
        }
        
        this.fetchStatus = '取得中...';

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                this.fetchStatus = `取得失敗: ${response.status}`;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.fetchStatus = '取得成功';
            return data;
        } catch (error) {
            this.fetchStatus = `取得失敗: ${error.message}`;
            throw error;
        }
    }

    async updateSensorStatus(sensorId, sensorType, newStatus, userData = {}) {
        const payload = {
            id: sensorId,
            type: sensorType,
            status: newStatus,
            ...userData
        };

        try {
            const response = await fetch(this.gasUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating sensor status:', error);
            throw error;
        }
    }

    async fetchAllSensors() {
        return this._fetchSensorData();
    }

    async fetchSensorsByStatus(status) {
        return this._fetchSensorData({ statusType: status });
    }

    async fetchFreeSensors() {
        return this.fetchSensorsByStatus('free');
    }

    async fetchInUseSensors() {
        return this.fetchSensorsByStatus('in use');
    }

    getFetchStatus() {
        return this.fetchStatus;
    }
}

if (typeof window !== 'undefined') {
    window.SensorManager = SensorManager;
}