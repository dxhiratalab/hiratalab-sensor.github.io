class SensorManager {
    constructor(gasUrl) {
        this.gasUrl = gasUrl;
        this.status = '未取得'; // データ取得ステータス
        this.data = null; // 全センサーデータ (freeとinuseを結合したもの)
        // this.sensorDetails は this.data と同じものを指すようにする
    }

    // 全センサー情報を取得 (free と inuse をそれぞれ取得して結合)
    async fetchSensorStatus() {
        this.status = '取得中...';
        try {
            // 空きセンサーの取得
            const freeResponse = await fetch(`${this.gasUrl}?statusType=free`);
            if (!freeResponse.ok) {
                throw new Error(`空きセンサー取得エラー: ${freeResponse.status}`);
            }
            const freeSensors = await freeResponse.json();
            console.log('Received free sensors:', freeSensors);

            // 使用中センサーの取得
            const inUseResponse = await fetch(`${this.gasUrl}?statusType=inuse`);
            if (!inUseResponse.ok) {
                throw new Error(`使用中センサー取得エラー: ${inUseResponse.status}`);
            }
            const inUseSensors = await inUseResponse.json();
            console.log('Received in-use sensors:', inUseSensors);

            // 取得したデータを結合
            // GASから返されるデータが配列であることを確認
            const combinedData = [];
            if (Array.isArray(freeSensors)) {
                combinedData.push(...freeSensors);
            }
            if (Array.isArray(inUseSensors)) {
                // IDの重複を避けるため、inUseSensors にしかないものを追加する
                // (ただし、GAS側で同一センサーが異なる状態で返ることは通常ないはず)
                inUseSensors.forEach(inUseSensor => {
                    if (!combinedData.some(s => s.id === inUseSensor.id && s.type === inUseSensor.type)) {
                        combinedData.push(inUseSensor);
                    }
                });
            }

            this.data = combinedData;
            this.status = '取得成功';
            console.log('Combined sensor data:', this.data);
            return this.data;

        } catch (error) {
            console.error('センサー情報取得エラー:', error);
            this.status = '取得失敗';
            this.data = null; // エラー時はデータをクリア
            throw error;
        }
    }

    // GASにセンサーの状態更新をPOSTリクエストで送信するメソッド
    async updateSensorStatusOnGAS(payloadForGAS) {
        // payloadForGAS の例: { id: "C1", type: "CAMERA", status: "in use" }
        // GASのdoPostは id, type, status のみを受け付ける
        try {
            console.log('Sending update to GAS:', payloadForGAS);
            const response = await fetch(this.gasUrl, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json', // GAS側がJSONを期待する場合
                    // GASが application/x-www-form-urlencoded を期待する場合は以下のように変更
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                // body: new URLSearchParams(payloadForGAS) // form-urlencodedの場合
                body: JSON.stringify(payloadForGAS) // application/jsonの場合 (GASのdoPostの実装に合わせる)
            });

            if (!response.ok) {
                let errorMsg = `GAS更新HTTPエラー! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    try {
                        errorMsg = await response.text();
                    } catch (textErr) { /* ignore */ }
                }
                throw new Error(errorMsg);
            }
            const result = await response.json();
            console.log('GAS update response:', result);
            return result; // 例: { success: true, message: "更新成功" }
        } catch (error) {
            console.error('GASへのセンサー状態更新エラー:', error);
            throw new Error(`センサー状態の更新に失敗しました: ${error.message}`);
        }
    }

    // sensorDetails のゲッター (this.data を返す)
    getSensorDetails() {
        return this.data;
    }

    getStatus() {
        return this.status;
    }

    getData() {
        return this.data;
    }

    // 以下のメソッドは、this.data (全センサーデータ) を元にフィルタリングする
    getSpecificSensorIds(type, model) {
        if (!this.data) return [];
        return this.data
            .filter(sensor =>
                sensor.type === type &&
                sensor.model === model
            )
            .map(sensor => sensor.id);
    }

    getWebCamC920nIds() {
        return this.getSpecificSensorIds('CAMERA', 'WebCam C920n');
    }

    // 互換性のためのメソッド (現在のGASのdoGet仕様では直接使われない)
    async fetchFreeSensors() {
        if (!this.data) await this.fetchSensorStatus(); // 全データ取得
        return this.data ? this.data.filter(s => s.status && s.status.toLowerCase() === 'free') : [];
    }

    async fetchInUseSensors() {
        if (!this.data) await this.fetchSensorStatus(); // 全データ取得
        return this.data ? this.data.filter(s => s.status && s.status.toLowerCase() === 'in use') : [];
    }

     // 互換性のため (プロトタイプにあったもの)
    getFetchStatus() {
        return this.status; // 単純化のため、メインのstatusを返す
    }
}

if (typeof window !== 'undefined') {
    window.SensorManager = SensorManager;
}
