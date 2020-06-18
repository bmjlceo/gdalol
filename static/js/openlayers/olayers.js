const url = 'http://pro.lurenji.xyz/';

let c = new Canvasot(document.getElementById('map'));
// 截图按钮
const screenshotBtn = $('#screenshot');
// 收起按钮
const packtBtn = $('#pack');
// 截图展示面板
const capturePanel = $('#capturePanel');
// 打开截图面板按钮
const capturePanelBtn = $('#capturePanelBtn');
// 截图容器
const captureContentWrapper = $('#captureContentWrapper');

$(document.body).on('click', function (e) {
	if (!$(this).hasClass('open')) {
		return;
	}
	const { target } = e;
	let ShowImg = $('#showImg').get(0);
	let bg = $('#bg').get(0);
	if (target == ShowImg || target == bg) {
		ShowImg.classList.remove('ShowImg');
		bg.classList.remove('open');
		$(ShowImg).hide();
		setTimeout(() => {
			ShowImg.remove();
			bg.remove();
		}, 300);
	}
});

c.RegisterAfterCapture((err, data) => {
	if (err) {
		console.log(err);
		return;
	}
	data = data.replace(/^data:image\/\w+;base64,/, '');
	const tip = $('#tip');
	const progress = $('#progress');
	const progressbar = $('#progressbar');
	tip.text('正在上传');
	$(progress).show();
	axios
		.post(
			'/upload/shot',
			{
				data,
				tile: window.tileId,
			},
			{
				onUploadProgress(e) {
					const { loaded, total } = e;
					const percent = Math.round((loaded / total) * 100);
					$(progressbar).css('width', `${percent}%`);
					if (percent === 100) {
						tip.text('上传成功');
						setTimeout(() => {
							$('#mask').hide();
							$(progress).hide();
							$(progressbar).css('width', '0%');
							tip.html('正在截图');
						}, 1000);
					}
				},
			}
		)
		.then(res => {
			const { fileUrl } = res.data;
			let oli = $('<li class="capture-item show"></li>');
			let newImg = new Image(150, 150);
			newImg.src = fileUrl;
			oli.append(newImg);
			$('#NoneCapture') && $('#NoneCapture').remove();
			captureContentWrapper.removeClass('empty').get(0).appendChild(oli.get(0));
			let top = oli.scrollTop();
			captureContentWrapper.scrollTop(top);
		})
		.catch(err => {
			console.log(err);
		});
});

const handleCaptrue = () => {
	c.handleCaptrue(() => {
		$('#mask').show();
	});
};

screenshotBtn.on('click', handleCaptrue);

function handlePack() {
	capturePanelBtn.show();
	capturePanel.removeClass('open');
}

packtBtn.on('click', handlePack);

function openCapturePanel() {
	$(this).hide();
	capturePanel.addClass('open');
}

capturePanelBtn.on('click', openCapturePanel);

function handleCaptureContentWrapper(e) {
	e = e || window.event;
	const target = e.target;
	if (!target.tagName === 'IMG') {
		return;
	}
	let bg = $(
		'<div id="bg" class="imgBg" style="background-color: #fff;"></div>'
	);
	const { naturalHeight, naturalWidth } = target;
	const { clientHeight, clientWidth } = document.body;
	let scale = null;
	if (clientHeight < naturalHeight || clientWidth < naturalWidth) {
		scale = (naturalHeight / clientHeight).toFixed(2);
	} else if (naturalHeight < 150 || naturalWidth < 150) {
		scale = 3;
	}
	let ShowImg = $(target).clone();
	ShowImg.attr({
		height: naturalHeight,
		id: 'showImg',
		width: naturalWidth,
	});
	$(document.body).addClass('open').append(bg, ShowImg);
	setTimeout(() => {
		ShowImg.addClass('ShowImg').css('transform', `scale(${scale})`);
		bg.addClass('open');
	});
}

captureContentWrapper.on('click', handleCaptureContentWrapper);
