
let trajectoryChart, scene, camera, renderer, missile, trail, animationId, isAnimating = false;

const SCALE = 1;

function initializeApp() {
    createStars();
    initializeChart();
    initialize3D();
    updateAllValues();
}

function createStars() {
    const starsContainer = document.getElementById('stars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        initializeApp();
    } else {
        document.getElementById('errorMessage').textContent = 'Invalid credentials';
    }
});

function logout() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function updateValue(param) {
    const value = document.getElementById(param).value;
    const display = document.getElementById(param+'Value');
    if(param==='angle'||param==='windAngle'){ display.textContent = value+'°'; }
    else if(param==='speed'||param==='windSpeed'){ display.textContent = value+' m/s'; }
    else if(param==='mass'){ display.textContent = value+' kg'; }
    else { display.textContent = value+' m'; }
}
function updateAllValues() {
    ['angle','speed','mass','diameter','height','windSpeed','windAngle'].forEach(updateValue);
}

function initializeChart() {
    let chartContainer = document.querySelector('.chart-container');
    if (chartContainer && !document.getElementById('trajectoryChart')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'trajectoryChart';
        canvas.style.height = '300px';
        canvas.style.width = '100%';
        chartContainer.appendChild(canvas);
    }
    const ctx = document.getElementById('trajectoryChart').getContext('2d');
    trajectoryChart = new Chart(ctx,{
        type:'line',
        data:{datasets:[{label:'Trajectory',data:[],borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,0.1)',fill:true,tension:0.2}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}}},scales:{x:{type:'linear',title:{display:true,text:'Range (m)',color:'#fff'},ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,0.1)'}},y:{type:'linear',title:{display:true,text:'Altitude (m)',color:'#fff'},ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,0.1)'}}}}
    });
}

function initialize3D() {
    const container = document.getElementById('simulation3D');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);

    camera = new THREE.PerspectiveCamera(75, container.offsetWidth/container.offsetHeight, 0.1, 10000);
    camera.position.set(0,500,1000);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040,0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff,0.7);
    directionalLight.position.set(100,200,100);
    scene.add(ambientLight,directionalLight);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000,10000),new THREE.MeshLambertMaterial({color:0x2a4d3a,transparent:true,opacity:0.8}));
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    scene.add(new THREE.GridHelper(1000000, 10000, 0x00ff88, 0x004422));

    missile = new THREE.Mesh(new THREE.CylinderGeometry(2,8,50,8),new THREE.MeshPhongMaterial({color:0xff4757}));
    scene.add(missile);

    trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color:0x00d4ff,transparent:true,opacity:0.8}));
    scene.add(trail);

    function animate3D(){
        requestAnimationFrame(animate3D);
        if(!isAnimating){
        
        }
        renderer.render(scene,camera);
    }
    animate3D();
}

function runSimulation(){
    const params = {};
    ['angle','speed','mass','diameter','height','windSpeed','windAngle'].forEach(p=>params[p]=parseFloat(document.getElementById(p).value));

    document.getElementById('loading').style.display='block';
    document.getElementById('metricsDisplay').style.display='none';

    const result = simulateTrajectory(params);

    const scaledTrajectory = { x: result.trajectory.x.map(v=>v*SCALE), y: result.trajectory.y.map(v=>v*SCALE), time: result.trajectory.time };
    
    updateChart(result.trajectory);
    updateMetrics(result.metrics);
    animate3DTrajectory(scaledTrajectory);

    document.getElementById('loading').style.display='none';
}

function updateChart(traj){
    const data = traj.x.map((x,i)=>({x:x,y:traj.y[i]}));
    trajectoryChart.data.datasets[0].data = data;
    trajectoryChart.options.scales.x.max = Math.max(...traj.x)*1.1;
    trajectoryChart.options.scales.y.max = Math.max(...traj.y)*1.1;
    trajectoryChart.update();
}

function updateMetrics(metrics){
    document.getElementById('maxRange').textContent=(metrics.max_range/1000).toFixed(2)+' km';
    document.getElementById('maxHeight').textContent=(metrics.max_height/1000).toFixed(2)+' km';
    document.getElementById('flightTime').textContent=metrics.total_flight_time.toFixed(1)+' s';
    document.getElementById('impactSpeed').textContent=metrics.impact_speed.toFixed(0)+' m/s';
    document.getElementById('metricsDisplay').style.display='block';
}

function animate3DTrajectory(traj){
    if(animationId) cancelAnimationFrame(animationId);
    isAnimating=true;
    let index=0;
    const trailPoints=[];
    const maxTrailLength=50;
    function animateFrame(){
        if(index>=traj.x.length){ isAnimating=false; return; }
        missile.position.set(traj.x[index], traj.y[index], 0);
        trailPoints.push(new THREE.Vector3(traj.x[index], traj.y[index], 0));
        if(trailPoints.length>maxTrailLength) trailPoints.shift();
        trail.geometry.dispose();
        trail.geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
        camera.position.set(traj.x[index]-500,traj.y[index]+300,800);
        camera.lookAt(traj.x[index],traj.y[index],0);
        index+=2;
        animationId=requestAnimationFrame(animateFrame);
    }
    animateFrame();
}

window.addEventListener('resize',()=>{
    if(renderer){
        const container = document.getElementById('simulation3D');
        camera.aspect=container.offsetWidth/container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth,container.offsetHeight);
    }
});