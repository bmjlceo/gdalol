const olManager = {
	get typeArr() {
		return ['Drag', 'Circle', 'Polygon', 'Box', 'Flag', 'LineString'];
	},
	style: {
		// 默认黑色
		stoke: 'black',
		fill: 'rgba(255, 255, 255, 0.2)',
	},
	lastItem: 'Drag',
	currentDraw: {
		currentType: 'Drag',
		colorActiveIndex: 0,
		draw: null,
		feature: null,
	},
	// 设置id随机值的基数
	maxValue: 99999,

	/**
	 * 对象初始化
	 * @param {any} map
	 * @returns {void}
	 */
	init(map) {
		this.map = map;
	},

	/**
	 * 增加全屏全屏控件
	 * @returns {void}
	 */
	addFullScreen() {
		// 全屏控件
		let fullScreen = new ol.control.FullScreen();
		// 把fullScreen控件并加载到地图容器中
		this.map.addControl(fullScreen);
	},

	/**
	 * 增加区域滑动控件
	 * @returns {void}
	 */
	addZoomslider() {
		// 实例化ZoomSlider控件并加载到地图容器中
		let zoomslider = new ol.control.ZoomSlider();
		// 	把ZoomSlider控件加载到地图容器中
		this.map.addControl(zoomslider);
	},

	/**
	 * 增加tooltip并实习更新
	 * @returns {void}
	 */
	addTiptoolAndListen() {
		// 增加tooltip

		const ZoomContent = $('.ol-zoomslider button.ol-zoomslider-thumb');
		ZoomContent.attr(
			'data-beforeContent',
			map.getView().getZoom().toFixed(2) + '%'
		);

		(function () {
			// 对ZoomSlider控件进行样式调整
			// 拖动框的高度
			const zoomslider = $('.ol-zoomslider.ol-control');

			const zoomsliderHeight = zoomslider.get(0).clientHeight;

			// 获取+/-按钮的高度
			const ButtonZoomHeight = $('button.ol-zoom-in').get(0).clientHeight;

			const height = zoomsliderHeight + ButtonZoomHeight * 2 + 15;
			$('.ol-zoom.ol-control').css('width', height + 'px');
			zoomslider.css('height', `${ButtonZoomHeight}px`);
		})();

		// --------------------------------------------------------
		// 动态修改tooltip值
		// 处理兼容性
		const MutationObserver =
			window.MutationObserver ||
			window.WebKitMutationObserver ||
			window.MozMutationObserver;

		// 创建一个观察器实例并传入回调函数
		let observer = new MutationObserver(e => {
			scrollFunc();
		});

		// 以上述配置开始观察目标节点
		observer.observe(ZoomContent.get(0), {
			attributeFilter: ['style'],
			attributes: true,
		});

		function scrollFunc() {
			setTimeout(() => {
				ZoomContent.attr(
					'data-beforeContent',
					((map.getView().getZoom() / mapMaxZoom) * 100).toFixed(2) + '%'
				);
			});
		}
	},

	/**
	 * 增加鹰眼（鸟瞰图）
	 * @returns {void}
	 */
	addOverView() {
		// 鹰眼（鸟瞰图）
		const overviewMapControl = new ol.control.OverviewMap({
			//鹰眼控件样式（see in overviewmap-custom.html to see the custom CSS used）
			className: 'ol-overviewmap ol-custom-overviewmap',
			//鹰眼中加载同坐标系下不同数据源的图层
			layers: [image],
			//鹰眼控件展开时功能按钮上的标识（网页的JS的字符编码）
			collapseLabel: '\u00BB',
			//鹰眼控件折叠时功能按钮上的标识（网页的JS的字符编码）
			label: '\u00AB',
			//初始为展开显示方式
			collapsed: false,
		});

		// 把overviewMapControl控件并加载到地图容器中
		this.map.addControl(overviewMapControl);
	},

	/**
	 * 工具栏事件
	 * @returns {void}
	 */
	addToolBar() {
		const self = this;
		// 编辑事件
		const oedit = document.getElementById('edit');
		const otools = document.getElementById('tools');
		const closeBtn = document.getElementById('shut');
		const colorGroup = document.getElementById('colorGroup');
		const colorItems = document.querySelectorAll('.color-item');
		oedit.addEventListener('click', function () {
			const isActive = otools.classList.contains('active');
			if (!isActive) {
				otools.classList.add('active');
			}
		});
		closeBtn.addEventListener('click', function () {
			const isActive = otools.classList.contains('active');
			if (isActive) {
				otools.classList.remove('active');
			}

			// 复原reset
			colorItems[self.currentDraw.colorActiveIndex].classList.remove('active');
			self.currentDraw.colorActiveIndex = 0;
			colorItems[self.currentDraw.colorActiveIndex].classList.add('active');
		});

		colorGroup.addEventListener('click', function ({ target }) {
			// 如果点击的是颜色选项
			if (Array.prototype.includes.call(colorItems, target)) {
				const isActive = target.classList.contains('active');
				if (!isActive) {
					colorItems[self.currentDraw.colorActiveIndex] &&
						colorItems[self.currentDraw.colorActiveIndex].classList.remove(
							'active'
						);
					target.classList.add('active');

					const color = target.dataset.color;
					self.style.stoke = color;

					// 没有该颜色的图层
					if (!DataBox.colorLayerMap.has(color)) {
						console.log(`没有${color}颜色图层`);
						//实例化一个矢量图层Vector作为绘制层
						let source = new ol.source.Vector({ wrapX: false });
						let ColorVector = new ol.layer.Vector({
							source: source,
							style: new ol.style.Style({
								fill: new ol.style.Fill({
									color: self.style.fill,
								}),
								stroke: new ol.style.Stroke({
									color: self.style.stoke,
									width: 4,
								}),
							}),
						});
						DataBox.colorLayerMap.set(color, ColorVector);
						//将绘制层添加到地图容器中
						self.map.addLayer(ColorVector);
					}

					if (self.currentDraw.currentType !== 'Drag') {
						self.map.removeInteraction(self.currentDraw.draw);
						self.addInteraction(self.currentDraw.currentType);
					}

					self.currentDraw.colorActiveIndex = Array.prototype.findIndex.call(
						colorItems,
						item => {
							return Object.is(item, target);
						}
					);
				}
			}
		});
	},

	//根据绘制类型进行交互绘制图形处理
	addInteraction(value) {
		const self = this;
		const free = value === 'LineString';
		//绘制类型
		if (value !== 'Drag') {
			let geometryFunction, maxPoints;
			if (value === 'Box') {
				value = 'LineString';
				maxPoints = 2;
				geometryFunction = function (coordinates, geometry) {
					if (!geometry) {
						//多边形
						geometry = new ol.geom.Polygon(null);
					}
					let start = coordinates[0];
					let end = coordinates[1];
					geometry.setCoordinates([
						[start, [start[0], end[1]], end, [end[0], start[1]], start],
					]);
					return geometry;
				};
			}

			const layer = DataBox.colorLayerMap.get(self.style.stoke);
			const option = {
				//绘制层数据源
				source: layer.getSource(),
				/** @type {ol.geom.GeometryType}几何图形类型 */
				type: value,
				//几何信息变更时调用函数
				geometryFunction: geometryFunction,
				//最大点数
				maxPoints: maxPoints,
				freehand: free,
			};
			//实例化交互绘制类对象并添加到地图容器中
			self.currentDraw.draw = new ol.interaction.Draw(option);
			self.currentDraw.draw.on('drawend', self.handleDrawEnd.bind(self));
			self.map.addInteraction(self.currentDraw.draw);
		} else {
			//移除绘制图形
			self.map.removeInteraction(self.currentDraw.draw);
			// source = null;
			// //清空绘制图形
			// vector.setSource(source);
		}
	},

	// 画完之后，变回拖拽状态
	handleDrawEnd(e) {
		const self = this;
		self.currentDraw.draw = e.target;
		self.currentDraw.feature = e.feature;
		const targetEl = $('#Drag');

		// reset到drag工作
		targetEl.class;
		self.lastItem &&
			document.getElementById(self.lastItem).classList.remove('active');
		targetEl.addClass('active');
		self.lastItem = 'Drag';
		self.map.removeInteraction(self.currentDraw.draw);
		// --------------------------------------------------------------------

		const modalEl = $('#staticBackdrop');
		const titleEl = $('#recipient-title');
		const contentEl = $('#message-content');

		modalEl.modal();

		function handleCancal() {
			console.log('cancel');

			if (self.type === 'Flag') {
				DataBox.flagSource &&
					DataBox.flagSource.removeFeature(self.currentDraw.feature);
			} else {
				DataBox.colorLayerMap.forEach(item => {
					item.getSource().removeFeature(self.currentDraw.feature);
				});
			}
			offBoth();
			modalEl.modal('hide');
		}

		function handleSave() {
			const inputs = $('.form-control');
			let pass = true;
			Array.prototype.forEach.call(inputs, function (item) {
				const $item = $(item);
				const val = $item.val();
				if (!val) {
					$item.addClass('is-invalid');
					pass = false;
				} else {
					$item.removeClass('is-invalid');
				}
			});

			if (!pass) {
				return;
			}

			console.log('save');

			const id = Math.random() * self.maxValue;
			const title = titleEl.val();
			const content = contentEl.val();
			self.currentDraw.feature.id = id;
			self.currentDraw.feature.type = self.type;

			DataBox.featureData.push(new DataBox.Feature(id, title, content));
			console.log(DataBox.featureData);
			offBoth();
			modalEl.modal('hide');
		}

		function handleClose() {
			offBoth();
			modalEl.modal('hide');
		}

		function offBoth() {
			$('#cancel').off();
			$('#ok').off();
			$('#close').off();
			titleEl.val('');
			contentEl.val('');
		}

		$('#cancel').html('取消').on('click', handleCancal);
		$('#ok').html('保存').on('click', handleSave);
		$('#close').on('click', handleClose);
	},

	/**
	 * 交互动作
	 * @returns {void}
	 */
	addInteractionEve() {
		const self = this;
		//实例化一个矢量图层Vector作为绘制层
		let source = new ol.source.Vector({ wrapX: false });
		let ColorVector = new ol.layer.Vector({
			source: source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: self.style.fill,
				}),
				stroke: new ol.style.Stroke({
					color: self.style.stoke,
					width: 4,
				}),
			}),
		});
		DataBox.colorLayerMap.set(self.style.stoke, ColorVector);
		//将绘制层添加到地图容器中
		self.map.addLayer(ColorVector);

		const otypeGroup = document.getElementById('typeGroup');
		//绘制对象
		// let lastItem = 'Drag',
		let flag = false;

		/**
		 * 用户更改绘制类型触发的事件.
		 * @param {Event} e 更改事件
		 */

		otypeGroup.addEventListener('click', function (e) {
			const { type } = e.target.dataset;
			self.type = type;
			// 节流
			if (!self.typeArr.includes(type)) {
				return;
			}

			const targetEl = document.getElementById(type);
			const isActive = targetEl.classList.contains('active');
			if (!isActive) {
				self.lastItem &&
					document.getElementById(self.lastItem).classList.remove('active');
				targetEl.classList.add('active');
				self.lastItem = type;
			}

			if (type === 'Flag') {
				self.map.removeInteraction(self.currentDraw.draw);
				self.map.addEventListener('click', function (evt) {
					flag = true;
					let point = evt.coordinate;
					addVectorLabel(point);
				});
				return;
			} else {
				if (flag) {
					flag = false;
					self.map.removeEventListener('click');
				}
			}

			//移除绘制图形
			self.map.removeInteraction(self.currentDraw.draw);
			self.currentDraw.currentType = type;
			self.addInteraction(type);
		});

		// -------------------------------------------------------------------------------
		/**
		 * 创建矢量标注样式函数,设置image为图标ol.style.Icon
		 * @param {ol.Feature} feature 要素
		 */

		//矢量标注的数据源
		const vectorSource = new ol.source.Vector({
			features: [],
			wrapX: false,
		});
		DataBox.flagSource = vectorSource;
		vectorSource.on('addfeature', self.handleDrawEnd.bind(self));

		//矢量标注图层
		const vectorLayer = new ol.layer.Vector({
			source: vectorSource,
		});
		self.map.addLayer(vectorLayer);

		const createLabelStyle = function (feature) {
			return new ol.style.Style({
				/**{olx.style.IconOptions}类型*/
				image: new ol.style.Icon({
					anchor: [0.1, 0],
					anchorOrigin: 'bottom-left',
					anchorXUnits: 'fraction',
					anchorYUnits: 'pixels',
					//图标缩放比例
					scale: 0.3,
					color: self.style.stoke,
					//透明度
					// opacity: 0.75,
					//图标的url
					src: '/img/location.png',
				}),
			});
		};

		/**
		 * 添加一个新的标注（矢量要素）
		 * @param {ol.Coordinate} coordinate 坐标点
		 */
		function addVectorLabel(coordinate) {
			//新建一个要素 ol.Feature
			let newFeature = new ol.Feature({
				//几何信息
				geometry: new ol.geom.Point(coordinate),
			});
			//设置要素的样式
			newFeature.setStyle(createLabelStyle(newFeature));
			//将新要素添加到数据源中
			vectorSource.addFeature(newFeature);
			self.map.removeEventListener('click');
		}
	},
};
