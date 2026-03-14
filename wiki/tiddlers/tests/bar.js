describe('bar series', function() {

beforeAll(function() {
	$tw.test.startTestMode();
	jasmine.addMatchers($tw.test.customMatchers);
});

function testNodesEqualExceptCoords(adapter, expectedNodes) {
	const data = adapter.testLast.series[0].data;
	for (var i = 0; i < expectedNodes.length; i++) {
		const expected = expectedNodes[i];
		const actual = data[i];
		expected.x = actual.x;
		expected.y = actual.y;
	}
	expect(data).toEqual(expectedNodes);
};

it('can handle empty graph', function() {
	const adapter = new $tw.test.GraphEngine({ graph: {type: "bar"}});
	const options = adapter.testLast;
	expect(options.series[0].data).toEqual([]);
	// Even if not specified, bar graphs need SOMETHING for axes, or it
	// fails to render anything.
	expect(options.xAxis).not.toBeUndefined();
	expect(options.yAxis).not.toBeUndefined();
});

it('can manipulate node labels', function() {
	const adapter = new $tw.test.GraphEngine({ graph: {type: "bar"},
		nodes: {
			A: {label: "match", value: 3},
			B: {label: "match", value: 4},
			C: {value: 2}}});
	const data = adapter.testLast.series[0].data;
	expect(data).toEqual([
		{id: "A", value: 3, name: "match", label: {show: true, position: "bottom"}},
		{id: "B", value: 4, name: "match", label: {show: true, position: "bottom"}},
		{id: "C", value: 2}]);
});

/*** Events ***/

/*
class EChartsEvent {
	constructor(type, alternates, mouseType) {
		this.type = type;
		this.event = {
			event: {type: mouseType || type} // fill-in for a MouseEvent
		}
		for (var value in alternates) {
			this[value] = alternates[value];
		}
	}

	componentIndex = 0;
	componentType = "series";
	componentSubType = "graph";
	seriesIndex = 0;
	seriesType = "graph";
	seriesName = "series\u00000";
	dataIndex = 0;
	dataType = "node";
	name = "";
}

it("handles node click event as 'actions'", function() {
	const adapter = new $tw.test.GraphEngine({nodes: {A: {actions: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("actions");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
	});
	// This zr event gets fired first, and our adapter needs to ignore it
	adapter.echarts.getZr().dispatchEvent({
		type: "dblclick", offsetX: 5, offsetY: 5,
		target: {id: 2731},
		event: {
			event: {type: "dblclick"} // fill-in for a MouseEvent
		}
	});
	adapter.testEvent(new EChartsEvent("dblclick", { data: {id: "A"}}));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles edge click event as 'actions'", function() {
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {}, B: {}},
		edges: {AB: {from: "A", to: "B", actions: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("actions");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
	});
	// This zr event gets fired first, and our adapter needs to ignore it
	adapter.echarts.getZr().dispatchEvent({
		type: "dblclick", offsetX: 5, offsetY: 5,
		target: {id: 2731}, // The id is pretty arbitrary
		event: {
			event: {type: "dblclick"} // fill-in for a MouseEvent
		}
	});
	adapter.testEvent(new EChartsEvent("dblclick", {
		dataType: "edge", data: {id: "AB", from: "A", to: "B"}
	}));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles graph double click event as 'doubleclick'", function() {
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {x:1000, y:-1000}, B: {x: 1010, y: -1010}}});
	spyOn(adapter.echarts, "convertFromPixel").and.callFake(function(finder, value) {
		expect(finder).toEqual({seriesIndex: 0});
		return [value[0]+1000, value[1]-1000];
	});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("doubleclick");
		expect(graphEvent.objectType).toBe("graph");
		expect(variables.x).toBe(1005);
		expect(variables.y).toBe(-995);
	});
	adapter.echarts.getZr().dispatchEvent({
		type: "dblclick", offsetX: 5, offsetY: 5,
		event: {
			event: {type: "dblclick"} // fill-in for a MouseEvent
		}
	});
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles node hover event", function() {
	const adapter = new $tw.test.GraphEngine({nodes: {A: {hover: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("hover");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
	});
	adapter.testEvent(new EChartsEvent("mouseover", { data: {id: "A"} }));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles edge hover event", function() {
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {}, B: {}},
		edges: {AB: {from: "A", to: "B", hover: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("hover");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
	});
	adapter.testEvent(new EChartsEvent("mouseover", {
		dataType: "edge",
		data: {id: "AB", from: "A", to: "B"},
	}));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles node blur event", function() {
	const adapter = new $tw.test.GraphEngine({nodes: {A: {blur: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("blur");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
	});
	adapter.testEvent(new EChartsEvent("mouseout", { data: {id: "A"}}, "mousemove"));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles edge blur event", function() {
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {}, B: {}},
		edges: {AB: {from: "A", to: "B", blur: true}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("blur");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
	});
	adapter.testEvent(new EChartsEvent("mouseout", {
		dataType: "edge", data: {id: "AB", from: "A", to: "B"},
	}, "mousemove"));
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("handles node free event with physics", function() {
	// This event requires special handling since ECharts doesn't handle
	// it the way we need it to be handled, which is to say as a "free" event
	// and not a "mouse release while we just happen to be over a node" event.
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {free: true, x: 52, y: 38}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("free");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(variables.x).toBe(34.69);
		expect(variables.y).toBe(47.41);
	});
	function makeEChartEvent(type, id, x, y, mouseType) {
		return new EChartsEvent(type, {
			dataIndex: 7, data: {id: id},
			event: {
				offsetX: x,
				offsetY: y,
				// fill-in for a MouseEvent
				event: {type: mouseType || type}
			}
		});
	};
	// There's a whole chain of stuff we've got to access to learn a
	// single node's location...
	var lastFixedNode;
	spyOn(adapter.echarts, "getModel")
		.and.returnValue({ getSeriesByIndex: function(index) {
			expect(index).toBe(0);
			return {
				getGraph: () => {
					return { getNodeById: function(id) {
						expect(id).toBe("A");
						return {
							getLayout: () => [34.687, 47.412],
							dataIndex: 7
						};
					}}
				},
				forceLayout: {
					setFixed: function(nodeIndex) {
						lastFixedNode = nodeIndex;
					}
				}
			}
		}});
	const zrEvent = {
		type: "dragend",
		target: {id: 2731}, // The id is pretty arbitrary
		event: { type: "mouseup" }
	};
	// This event should cause nothing to happen, because it did not
	// correspond to a mousedown event, so it couldn't have been a drag.
	adapter.echarts.getZr().dispatchEvent(zrEvent);
	expect(onevent).not.toHaveBeenCalled();
	expect(lastFixedNode).toBeUndefined();
	// Now we start with a mousedown event
	adapter.testEvent(makeEChartEvent("mousedown", "A", 25, 20));
	adapter.echarts.getZr().dispatchEvent(zrEvent);
	expect(onevent).toHaveBeenCalledTimes(1);
	expect(lastFixedNode).toBe(7);
});

it("handles node free event without physics", function() {
	// This event requires special handling since ECharts doesn't handle
	// it the way we need it to be handled, which is to say as a "free" event
	// and not a "mouse release while we just happen to be over a node" event.
	const adapter = new $tw.test.GraphEngine({
		graph: {physics: false},
		nodes: {A: {free: true, x: 52, y: 38}}});
	var onevent = $tw.test.spyOnEvent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("free");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(variables.x).toBe(34.64);
		expect(variables.y).toBe(47.87);
	});
	function makeEChartEvent(type, id, x, y, mouseType) {
		return {
			type: type,
			componentIndex: 0, componentType: "series", componentSubType: "graph",
			seriesIndex: 0,    seriesType: "graph",     seriesName: "series\u00000",
			dataIndex: 7,      dataType: "node",        data: {id: id},
			name: "",
			event: {
				offsetX: x,
				offsetY: y,
				// fill-in for a MouseEvent
				event: {type: mouseType || type}
			}
		};
	};
	// There's a whole chain of stuff we've got to access to learn a
	// single node's location...
	var lastFixedNode;
	spyOn(adapter.echarts, "getModel")
		.and.returnValue({ getSeriesByIndex: function(index) {
			expect(index).toBe(0);
			return {
				getGraph: () => {
					return { getNodeById: function(id) {
						expect(id).toBe("A");
						return { getLayout: () => [34.643, 47.865] }
					}}
				},
				forceLayout: null
			}
		}});
	const zrEvent = {
		type: "dragend",
		target: {id: 2731}, // The id is pretty arbitrary
		event: { type: "mouseup" }
	};
	// Now for the mouse event
	adapter.testEvent(makeEChartEvent("mousedown", "A", 25, 20));
	adapter.echarts.getZr().dispatchEvent(zrEvent);
	expect(onevent).toHaveBeenCalledTimes(1);
	expect(lastFixedNode).toBeUndefined();
});

it("does not support edge drag and free events", function() {
	// But it doesn't crash either if the user tries to do it!
	const adapter = new $tw.test.GraphEngine({
		nodes: {A: {}, B: {}}, edges: {A: {from: "A", to: "B"}}});
	var onevent = $tw.test.spyOnEvent(adapter, function() {});
	function makeEChartEvent(type, id, x, y, mouseType) {
		return new EChartsEvent(type, {
			dataIndex: 7, data: {id: id},
			event: {
				offsetX: x,
				offsetY: y,
				// fill-in for a MouseEvent
				event: {type: mouseType || type}
			}
		});
	};
	// It won't do anything when mouse down on edges occurs
	adapter.testEvent(makeEChartEvent("mousedown", "edge"));
	expect(onevent).not.toHaveBeenCalled();
	// It also doesn't do anything on mouseup, even if we initialize a drag
	// with a node sharing the same id.
	adapter.testEvent(makeEChartEvent("mousedown", "node"));
	adapter.testEvent(makeEChartEvent("mouseup", "edge"));
	expect(onevent).not.toHaveBeenCalled();
});
*/

});
