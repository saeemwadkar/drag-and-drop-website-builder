const canvas = document.getElementById('canvas');
const draggables = document.querySelectorAll('.draggable');
let selectedElement = null;

draggables.forEach(el => {
    el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('type', e.target.dataset.type);
    });
});

canvas.addEventListener('dragover', e => e.preventDefault());

canvas.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    let el;
    if (type === 'text') {
        el = document.createElement('p');
        el.innerHTML = '<span class="content">Editable Text</span>';
    } else if (type === 'button') {
        el = document.createElement('button');
        el.innerHTML = '<span class="content">Click Me</span>';
    } else if (type === 'image') {
        el = document.createElement('img');
        el.src = 'https://via.placeholder.com/150';
        el.style.width = '150px';
        el.style.height = '150px';
    }

    el.style.position = 'absolute';
    el.style.left = e.offsetX + 'px';
    el.style.top = e.offsetY + 'px';
    el.style.cursor = 'move';
    el.style.padding = '5px';
    el.style.minWidth = '40px';

    if (type !== 'image') el.setAttribute('contenteditable', true);

    el.addEventListener('click', () => selectElement(el));
    el.addEventListener('mousedown', startDrag);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = (event) => {
        event.stopPropagation();
        canvas.removeChild(el);
        selectedElement = null;
    };

    el.appendChild(deleteBtn);
    canvas.appendChild(el);
});

function startDrag(e) {
    const el = e.currentTarget;
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const resizeZone = 16;

    if (e.offsetX > el.offsetWidth - resizeZone && e.offsetY > el.offsetHeight - resizeZone) return;
    if (e.target.classList.contains('delete-btn')) return;

    const offsetX = e.clientX - elRect.left;
    const offsetY = e.clientY - elRect.top;

    function moveAt(pageX, pageY) {
        let newLeft = pageX - canvasRect.left - offsetX;
        let newTop = pageY - canvasRect.top - offsetY;

        newLeft = Math.max(0, Math.min(newLeft, canvas.clientWidth - el.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, canvas.clientHeight - el.offsetHeight));

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', function stopDrag() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', stopDrag);
    });
}

function selectElement(el) {
    if (selectedElement) selectedElement.classList.remove('selected');
    selectedElement = el;
    el.classList.add('selected');
    document.getElementById('elementText').value = el.tagName === 'IMG' ? el.src : el.querySelector('.content')?.textContent || '';
    document.getElementById('fontSize').value = parseInt(window.getComputedStyle(el).fontSize) || '';
    document.getElementById('textColor').value = rgbToHex(window.getComputedStyle(el).color);
    document.getElementById('bgColor').value = rgbToHex(window.getComputedStyle(el).backgroundColor);
    if (el.tagName === 'IMG') {
        document.getElementById('imgWidth').value = parseInt(el.style.width) || 150;
        document.getElementById('imgHeight').value = parseInt(el.style.height) || 150;
    }
}

function rgbToHex(rgb) {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const result = rgb.match(/\d+/g);
    return `#${result.map(x => (+x).toString(16).padStart(2, '0')).join('')}`;
}

document.getElementById('propertiesForm').addEventListener('input', () => {
    if (!selectedElement) return;
    const text = document.getElementById('elementText').value;
    const fontSize = document.getElementById('fontSize').value;
    const textColor = document.getElementById('textColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const imgWidth = document.getElementById('imgWidth').value;
    const imgHeight = document.getElementById('imgHeight').value;

    if (selectedElement.tagName === 'IMG') {
        selectedElement.src = text;
        if (imgWidth) selectedElement.style.width = imgWidth + 'px';
        if (imgHeight) selectedElement.style.height = imgHeight + 'px';
    } else {
        const contentSpan = selectedElement.querySelector('.content');
        if (contentSpan) contentSpan.textContent = text;
        if (fontSize) selectedElement.style.fontSize = fontSize + 'px';
        selectedElement.style.color = textColor;
        selectedElement.style.backgroundColor = bgColor;
    }
});
