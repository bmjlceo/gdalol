class Feature {
	constructor(id, title, content) {
		this.id = id;
		this.title = title;
		this.content = content;
	}
}

const DataBox = {
	featureData: [],
	Feature, // 类
	colorLayerMap: new Map(), // 颜色图层集合
	flagSource: null, // 旗帜源
};
