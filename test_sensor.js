import SensorManager from './sensorManager.js';

// センサーマネージャーのインスタンスを作成
const sensorManager = new SensorManager('YOUR_GAS_SCRIPT_URL');

// データを取得して表示する関数
async function testSensorManager() {
    try {
        // データを取得
        const data = await sensorManager.fetchSensorStatus();
        
        // 状態を表示
        console.log('状態:', sensorManager.getStatus());
        
        // 生データを表示
        console.log('生データ:', sensorManager.getData());
        
        // 整形されたデータを表示
        console.log('整形されたデータ:', sensorManager.formatData());
    } catch (error) {
        console.error('テスト実行中にエラーが発生:', error);
    }
}

// テストを実行
testSensorManager(); 