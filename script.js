import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Получаем ID модели из URL
const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get('id') || '1';

// Обновляем заголовок и ссылку на скачивание
document.getElementById('model-title').textContent = `Просмотр Модели ${modelId}`;
document.getElementById('download-btn').href = `models/model${modelId}.glb`;

// Настройка сцены Three.js
const canvas = document.getElementById('canvas3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fa);

// Камера
const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 5);

// Рендерер
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true 
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Освещение
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);

// Управление камерой (OrbitControls)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;
controls.enableZoom = true;
controls.minDistance = 2;
controls.maxDistance = 20;

// Загрузка модели
const loader = new GLTFLoader();
let model = null;

loader.load(
    `models/model${modelId}.glb`,
    (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // Центрирование и масштабирование модели
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        model.scale.setScalar(scale);

        model.position.sub(center.multiplyScalar(scale));
        model.position.y -= size.y * scale / 2;

        // Анимация загрузки завершена
        console.log('Модель загружена успешно');
    },
    (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        console.log(`Загрузка: ${percent}%`);
    },
    (error) => {
        console.error('Ошибка загрузки модели:', error);
        alert('Не удалось загрузить модель. Убедитесь, что файл существует в папке models/');
    }
);

// Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
});