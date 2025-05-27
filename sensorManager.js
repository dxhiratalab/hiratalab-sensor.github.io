// sensorManager.js
class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.fetchStatus = '未取得'; // fetch操作の一般ステータス
        this.freeSensorList = null;
        this.inUseSensorList = null;
    }

    async _fetchSensorData(statusType) {
        // GAS URLに既に '?' が含まれているか確認して正しくパラメータを連結
        const paramSeparator = this.gasUrl.includes('?') ? '&' : '?';
        let fetchUrl = this.gasUrl + paramSeparator + 'statusType=' + encodeURIComponent(statusType);
        
        this.fetchStatus = `取得中 (${statusType})...`;
        console.log(`Workspaceing ${statusType} sensors from: ${fetchUrl}`); // URLをログに出力

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                this.fetchStatus = `取得失敗 (${statusType}): ${response.status}`;
                throw new Error(`HTTP error! status: ${response.status} for ${statusType} sensors`);
            }
            const data = await response.json();
            this.fetchStatus = `取得成功 (${statusType})`;
            console.log(`Received ${statusType} sensors:`, data);
            return data;
        } catch (error) {
            this.fetchStatus = `取得失敗 (${statusType}): ${error.message}`;
            console.error(`Error fetching ${statusType} sensors:`, error);
            throw error; // エラーを再スローして呼び出し元で処理できるようにする
        }
    }

    async fetchFreeSensors() {
        this.freeSensorList = await this._fetchSensorData('free');
        return this.freeSensorList;
    }

    async fetchInUseSensors() {
        this.inUseSensorList = await this._fetchSensorData('in use');
        return this.inUseSensorList;
    }

    // getFreeSensors() は fetchFreeSensors の結果を返すようにするか、
    // または fetchFreeSensors が直接リストを返すので不要になるかもしれません。
    // ここでは、fetchメソッドがリストを直接返すので、個別のgetterは必須ではないかもしれません。
    // 必要に応じて残すか、fetchメソッドの結果を直接利用します。
    // getFreeSensors() { return this.freeSensorList; }
    // getInUseSensors() { return this.inUseSensorList; }

    getFetchStatus() {
        return this.fetchStatus;
    }
}

// ブラウザ環境でも使えるようにグローバルに公開
if (typeof window !== 'undefined') {
    window.SensorManager = SensorManager;
}