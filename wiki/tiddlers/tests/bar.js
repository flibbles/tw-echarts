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

/*** Axes ***/

it('can select category axes', function() {
	const adapter = new $tw.test.GraphEngine({
		graph: {type: "bar"},
		axes: {x: {type: "category"}}
	});
	const options = adapter.testLast;
	expect(options.xAxis).toEqual({type: "category"});
});

});
