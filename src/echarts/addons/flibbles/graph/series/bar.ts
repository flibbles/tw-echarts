export const name = "bar";
import { Shape2symbol } from '../utils.js';

export function init(echarts): void { };

export function defaultConfig(axes) {
	var objects = {xAxis: {}, yAxis: {}};
	for (var id in axes) {
		var axis = {};
		if (axes[id].type) {
			axis.type = axes[id].type;
		}
		if (axes[id].categories) {
			axis.data = axes[id].categories;
			if (!axis.type) {
				axis.type = "category";
			}
		}
		objects[id + "Axis"] = axis;
	}
	return objects;
};

export function update(objects: GraphObjects): void {
	const series = {};
	const graph = objects.graph;
	if (graph) {
		series.type = "bar";
		series.label = {formatter: "{b}"};
	}
	const data = createData(objects.nodes || {});
	series.data = data;
	return series;
};

function createData(newNodes) {
	return toArray(newNodes || {})
		.sort((a,b) => a.x - b.x)
		.map(function(n) {
			var cleaned = { id: n.id };
			if (n.value !== undefined) {
				cleaned.value = n.value;
			}
			if (n.x !== undefined) {
				cleaned.x = n.x;
			}
			if (n.label !== undefined) {
				cleaned.name = n.label;
				cleaned.label = {show: true};
			}
			if (n.color !== undefined) {
				cleaned.itemStyle = {color: n.color};
			}
			return cleaned;
		});
};

function toArray(entries) {
	var output = [];
	for (var id in entries) {
		if (entries[id]) {
			output.push(entries[id]);
		}
	}
	return output;
};
