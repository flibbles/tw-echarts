export const name = "bar";
import { Shape2symbol } from '../utils.js';

export function init(echarts): void {
	this.data = Object.create(null);
};

export function defaultConfig(axes) {
	var objects = {xAxis: {}, yAxis: {}};
	for (var id in axes) {
		var axis = {};
		if (axes[id].type) {
			axis.type = axes[id].type;
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
	}
	const data = createData(this.data, objects.nodes || {});
	series.data = data;
	return series;
};

function createData(oldNodes, newNodes) {
	return merge(oldNodes, newNodes || {})
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
				cleaned.label = {show: true, position: "bottom"};
			}
			if (n.color !== undefined) {
				cleaned.itemStyle = {color: n.color};
			}
			return cleaned;
		});
};

function merge(entries, updates) {
	for (var id in updates) {
		var update = updates[id];
		if (update) {
			update.id = id;
			entries[id] = update;
		} else { // Must be null, thus a deletion
			entries[id] = undefined;
		}
	}
	var output = [];
	for (var id in entries) {
		if (entries[id]) {
			output.push(entries[id]);
		}
	}
	return output;
};
