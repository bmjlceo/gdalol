/**
 * Define a namespace for the application.
 */
let app = {};

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function () {
	ol.interaction.Pointer.call(this, {
		handleDownEvent: app.Drag.prototype.handleDownEvent,
		handleDragEvent: app.Drag.prototype.handleDragEvent,
		handleMoveEvent: app.Drag.prototype.handleMoveEvent,
		handleUpEvent: app.Drag.prototype.handleUpEvent,
	});

	/**
	 * @type {ol.Pixel}
	 * @private
	 */
	this.coordinate_ = null;

	/**
	 * @type {string|undefined}
	 * @private
	 */
	this.cursor_ = 'pointer';

	/**
	 * @type {ol.Feature}
	 * @private
	 */
	this.feature_ = null;

	/**
	 * @type {string|undefined}
	 * @private
	 */
	this.previousCursor_ = undefined;
};
ol.inherits(app.Drag, ol.interaction.Pointer);

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function (evt) {
	var map = evt.map;

	var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
		return feature;
	});

	if (feature) {
		this.coordinate_ = evt.coordinate;
		this.feature_ = feature;
	}

	return !!feature;
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function (evt) {
	var deltaX = evt.coordinate[0] - this.coordinate_[0];
	var deltaY = evt.coordinate[1] - this.coordinate_[1];

	var geometry = this.feature_.getGeometry();
	geometry.translate(deltaX, deltaY);

	this.coordinate_[0] = evt.coordinate[0];
	this.coordinate_[1] = evt.coordinate[1];
	app.DragFlag = true;
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function (evt) {
	if (this.cursor_) {
		var map = evt.map;
		var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
			return feature;
		});
		var element = evt.map.getTargetElement();
		if (feature) {
			if (element.style.cursor != this.cursor_) {
				this.previousCursor_ = element.style.cursor;
				element.style.cursor = this.cursor_;
			}
		} else if (this.previousCursor_ !== undefined) {
			element.style.cursor = this.previousCursor_;
			this.previousCursor_ = undefined;
		}
	}
};

/**
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function (evt) {
	var map = evt.map;

	var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
		return feature;
	});

	if (feature && !app.DragFlag) {
		this.coordinate_ = evt.coordinate;
		this.feature_ = feature;
		let featureItem = {
			data: null,
			idx: null,
		};
		DataBox.featureData.forEach((item, index) => {
			if (item.id === feature.id) {
				featureItem.data = item;
				featureItem.idx = index;
			}
		});
		if (featureItem.data) {
			const modalEl = $('#staticBackdrop');
			const titleEl = $('#recipient-title');
			const contentEl = $('#message-content');

			titleEl.val(featureItem.data.title);
			contentEl.val(featureItem.data.content);

			function offBoth() {
				$('#cancel').off();
				$('#ok').off();
				$('#close').off();
				titleEl.val('');
				contentEl.val('');
			}

			function handleDelete() {
				if (feature.type === 'Flag') {
					DataBox.flagSource.removeFeature(feature);
				} else {
					DataBox.colorLayerMap.forEach(item => {
						item.getSource().removeFeature(feature);
					});
				}
				DataBox.featureData.splice(featureItem.idx, 1);
				console.log(DataBox.featureData);
				console.log('delete');
				offBoth();
				modalEl.modal('hide');
			}

			function handleModify() {
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

				DataBox.featureData[featureItem.idx].title = titleEl.val();
				DataBox.featureData[featureItem.idx].content = contentEl.val();
				console.log(DataBox.featureData);
				console.log('close');
				offBoth();
				modalEl.modal('hide');
			}

			function handleClose() {
				offBoth();
				modalEl.modal('hide');
			}

			$('#cancel').html('删除').on('click', handleDelete);
			$('#ok').html('修改').on('click', handleModify);
			$('#close').on('click', handleClose);

			modalEl.modal();
		}
	}

	this.coordinate_ = null;
	this.feature_ = null;
	app.DragFlag = false;

	return false;
};
