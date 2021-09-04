// main buttons
const operations = document.getElementById("operations");
const buttons = operations.children;
const descriptions = document.getElementById("descriptions");
const instructions = descriptions.children;
let currBtn;                        // active main button

let isOpen = false;                 // modal-window

const R = 15;                       // edges drawing
const max = 100;

let countOfVert = 0,                // vertices and edges drawing
    vertInPair = [];

let vertices = [],                  // arrays
    graph = [],
    matrix = [],
    used = [];

let countOfComps = 0;

for(let i = 0; i<max; ++i){         // initialization of arrays
    vertices.push([]);
    graph.push([]);
    used.push(false);
}
for(let i = 0; i<max; ++i){
    let matrixInside = [];
    for(let j = 0; j<max; ++j){
        matrixInside.push(0);
    }
    matrix.push(matrixInside);
}

// canvas
const canv = document.getElementById('workSpace');
const ctx = canv.getContext('2d');
const rect = canv.getBoundingClientRect();

const canvM = document.getElementById('matrix');
const ctxM = canvM.getContext('2d');

// secondary functions for main buttons
function drawVert(x,y, numOfVert){
    ctx.beginPath();
    ctx.fillStyle = '#181E36';
    //console.log(x, y);
    ctx.arc(x, y, R, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '15px Montserrat';
    ctx.fillText(String(numOfVert), x, y+5);
    ctx.closePath();
}
function drawEdge(x1, y1, x2, y2, color, lineWidth = 5){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if(x1 == x2 && y1 == y2){
        ctx.arc(x1 - 20, y1 - 20, 25, 0, Math.PI*2); 
    }
    else{
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.closePath();
}
function drawWeight(x1, y1, x2, y2, weight, color, lineWidth = 2){
    let centerX = (x1 + x2)/2;
    let centerY = (y1 + y2)/2;
    if(x1 == x2 && y1 == y2){  
        centerX -= 36;
        centerY -= 36;
    }

    ctx.beginPath();
    ctx.fillStyle='#FFF';
    ctx.strokeStyle=color;
    ctx.lineWidth=lineWidth;
    ctx.fillRect(centerX-10, centerY-10, 20, 20);
    ctx.strokeRect(centerX-10, centerY-10, 20, 20);
    ctx.font='14px Montserrat';
    ctx.fillStyle='#181E36';
    ctx.textAlign='center';
    ctx.fillText(weight, centerX, centerY+5);
    ctx.closePath();
}

function clearWorkSpace(){
    ctx.beginPath();
    ctx.fillStyle='#FFF';
    ctx.fillRect(0, 0, 1600, 900);
    ctxM.closePath();
}
function clearMatrixSpace(){
    ctxM.beginPath();
    ctxM.fillStyle='#FFF';
    ctxM.fillRect(0, 0, 1600, 900);
    ctxM.closePath();
}
function hideResult(){
    result.classList.remove('activeResult');
}

function dfs(v){
    used[v] = true;

    for(u of graph[v]){
        if (!used[u[0]]) {
            dfs(u[0]);
        }
    }
}
function isConnected(){
    for(let i = 0; i<countOfVert; ++i){
        if(!used[i]){
            dfs(i);
            countOfComps++;
        } 
    }
    if(countOfComps == 1) return true;
    else return false;
} 
// DSU
let dsu = [];
function initDsu(){
    for(let i = 0; i<countOfVert; ++i) dsu[i] = i;
}
function find(v){
    return dsu[v];
}
function union(v, u){
    if(dsu[v] == dsu[u]) return;
    for(let i = 0; i<countOfVert; ++i){
        if(dsu[i] == dsu[v] && i != v) {
            dsu[i] = dsu[u];
        }
    }
    dsu[v] = dsu[u];
}

let minSpanningTree = [],
    lengthOfTree = 0;
function Kraskal(edges){
    edges.sort(function(a, b){
        return a.w - b.w;
    });

    initDsu();

    for(let e of edges){
        console.log('Вершины: ', e.v, e.u);
        console.log('Было: ', dsu);
        if(find(e.v) != find(e.u)){
            union(e.v, e.u);
            minSpanningTree.push(e);
            lengthOfTree += e.w;
        }
        console.log('Стало: ', dsu);
    }
    console.log(minSpanningTree);
    console.log(lengthOfTree);
}
function showResult(answer){
    const result = document.getElementById('result');
    console.log(result);
    result.textContent = `Длинна экономического дерева: ${answer}`;
    result.classList.add('activeResult');
}

// functions for main buttons
function buildVert(v){
    const x = v.clientX-rect.left;
    const y = v.clientY-rect.top;
    /*console.log(v.clientX, v.clientY);
    console.log(rect.left, rect.top);*/

    drawVert(x, y, countOfVert);

    vertices[countOfVert] = [x, y, countOfVert];
    countOfVert++;
}
function buildEdge(v){
    const x = v.pageX-rect.left,
        y = v.pageY-rect.top;
    let len;
    for(u of vertices){
        len = Math.sqrt((x - u[0])*(x - u[0]) + (y - u[1])*(y - u[1]));
        if(len < R) {
            vertInPair.push(u);
            break;
        }
    }
        
    if(vertInPair.length == 2){
        let x1 = vertInPair[0][0],
            y1 = vertInPair[0][1],
            x2 = vertInPair[1][0],
            y2 = vertInPair[1][1];

        drawEdge(x1, y1, x2, y2, '#007EF9');
        drawVert(x1, y1, vertInPair[0][2]);
        drawVert(x2, y2, vertInPair[1][2]);

        const wrapper = document.getElementById('wrapper-modal');
        const textBox = document.getElementById('error');
        textBox.classList.remove('error');
        wrapper.classList.add('active');
        isOpen = true;
        const btnClose = document.getElementById('btnClose');
        
        function modalWindow(){
            if(isOpen == true){
                const edgeWeight = document.getElementById('textBox').value;
                
                if(Number(edgeWeight) > 0) {
                    graph[vertInPair[0][2]].push([vertInPair[1][2], Number(edgeWeight)]);
                    graph[vertInPair[1][2]].push([vertInPair[0][2], Number(edgeWeight)]);
                    matrix[vertInPair[0][2]][vertInPair[1][2]] = Number(edgeWeight);
                    matrix[vertInPair[1][2]][vertInPair[0][2]] = Number(edgeWeight);
                        
                    wrapper.classList.remove('active');
                    isOpen = false;
                    x1 = vertInPair[0][0],
                    y1 = vertInPair[0][1],
                    x2 = vertInPair[1][0],
                    y2 = vertInPair[1][1];
                    
                    drawWeight(x1, y1, x2, y2, edgeWeight, '#007EF9');
                    vertInPair.length = 0;
                }
                else {
                    textBox.classList.add('error');
                }
            }
        }

        btnClose.addEventListener('click', modalWindow);
    }
}
function clear(){
    clearWorkSpace();
    clearMatrixSpace();
    hideResult();

    vertices.length = 0;
    graph.length = 0;
    matrix.length = 0;
    used.length = 0;

    for(let i = 0; i<max; ++i){
        vertices.push([]);
        graph.push([]);
        used.push(false);
    }
    for(let i = 0; i<max; ++i){
        let matrixInside = [];
        for(let j = 0; j<max; ++j){
            matrixInside.push(0);
        }
        matrix.push(matrixInside);
    }
    vertInPair.length = 0;
    countOfVert = 0;
    countOfComps = 0;
}
function buildTree(){
    clearWorkSpace();
    clearMatrixSpace();
    hideResult();
    minSpanningTree = [],
    lengthOfTree = 0;
    let edges = [];
    for(let i = 0; i<countOfVert; ++i){
        for(let j = i; j<countOfVert; ++j){
            if(matrix[i][j] != 0){
                const edge = {
                    v: i,
                    u: j,
                    xV: vertices[i][0],
                    yV: vertices[i][1],
                    xU: vertices[j][0],
                    yU: vertices[j][1],
                    w: matrix[i][j]
                }
                edges.push(edge);
            }
        }
    }

    Kraskal(edges);
    for(e of edges){
        drawEdge(e.xV, e.yV, e.xU, e.yU, '#007EF9');
        drawVert(e.xV, e.yV, e.v);
        drawVert(e.xU, e.yU, e.u);
        drawWeight(e.xV, e.yV, e.xU, e.yU, e.w, '#007EF9');
    }
    for(e of minSpanningTree){
        drawEdge(e.xV, e.yV, e.xU, e.yU, '#FF7C00');

        drawVert(e.xV, e.yV, e.v);
        drawVert(e.xU, e.yU, e.u);

        drawWeight(e.xV, e.yV, e.xU, e.yU, e.w, '#FF7C00');
    }
    showResult(lengthOfTree);
}
function buildMatrix(){
    clearMatrixSpace();
    const canvMWidth = canvM.clientWidth;
    const canvMHeight = canvM.clientHeight;
    const scaleX = canvMWidth/countOfVert;
    const scaleY = canvMHeight/countOfVert;

    ctxM.beginPath();
    ctxM.strokeStyle = '#181E36';
    ctxM.lineWidth = 2;

    for(let i = scaleX; i<canvMWidth; i += scaleX){
        ctxM.moveTo(i, 0);
        ctxM.lineTo(i, canvMWidth);
    }
    ctxM.stroke();

    for(let i = scaleY; i<canvMHeight; i += scaleY){
        ctxM.moveTo(0, i);
        ctxM.lineTo(canvMHeight, i);
    }
    ctxM.stroke();
    ctxM.closePath();

    ctxM.textAlign='center';
    ctxM.textBaseline='middle';
    ctxM.fillStyle='#181E36';
    let iV = 0, jV = 0;
    for(let i = scaleY/2; i<canvMHeight; i += scaleY){
        for(let j = scaleX/2; j<canvMWidth; j += scaleX){
            ctxM.font=`${Math.round(scaleX/2)}px Montserrat`;
            ctxM.fillText(matrix[iV][jV], j, i);
            jV++;
        }
        jV = 0;
        iV++;
    }
}

function reset(){
    minSpanningTree = [];
    lengthOfTree = 0;
    countOfComps = 0;
    used.length = 0;
    for(let i = 0; i<max; ++i) used.push(false);     
}
// main
canv.addEventListener('click', v => {
    switch(currBtn){
        case buttons[0].dataset.btn:
            vertInPair = [];
            reset();
            buildVert(v);
            break;
        case buttons[1].dataset.btn:
            reset();
            buildEdge(v);
            break;
    }
});

// switch-functions
const toPress = el => {
    for(let i = 0; i<buttons.length;++i){
        buttons[i].classList.remove('btnPressed');
    }
    el.classList.add('btnPressed');
}
const toInst = el => {
    for(let i = 0;i<instructions.length;++i){
        instructions[i].classList.remove('activeInst');
        if(instructions[i].dataset.inst == el){
            instructions[i].classList.add('activeInst');
        }
    }
}

// main buttons' clicks
operations.addEventListener('click', e => {
    currBtn = e.target.dataset.btn;
    if(e.target != operations){
        toPress(e.target);
        toInst(currBtn);
        if(currBtn == buttons[2].dataset.btn) clear();
        if(currBtn == buttons[3].dataset.btn){
            if(isConnected() == true) buildTree();
            else{
                for(let i = 0;i<instructions.length;++i){
                    instructions[i].classList.remove('activeInst');
                }
                instructions[5].classList.add('activeInst');
            }
            buildMatrix();
        } 
    }
});
