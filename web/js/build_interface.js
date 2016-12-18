function Interface() {

	var me = this;
	this.controls = {}

	function build_data_selector() {
		VMT.utils.draw_options("#data_csv_select", VMT.settings.csv_files)
		me.controls["data_csv_select"] = d3.select("#data_csv_select")
	}
	build_data_selector()


	d3.select("#data_csv_select").on("change", function(d) {
		VMT.controller.draw_from_scratch()
	})

}

Interface.prototype = {
	get csv_path() {
		return this.controls["data_csv_select"].node().value
	}
}