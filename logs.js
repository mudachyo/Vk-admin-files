var LogsFunctions = {
  inputChangedTimeout: setTimeout(null),
  loadLock: false,
  pageCounter: 1,

  init: function() {
    this.initFilters();
    addEvent(window, 'scroll', this.loadNextLogsOnScroll);
  },
  initFilters: function() {
    LogsFunctions.initDatePickers();
    LogsFunctions.initInputs();
    LogsFunctions.initAdminsSelect();
  },
  initDatePickers: function() {
    // Nsh: those (* 1000) just adapters for timestamps
    var datepickerFromParams = {
      mode: 'd',
      width: 190,
      pastActive: true,
      onUpdate: LogsFunctions.loadByFilters.pbind()
    };
    if (getUrlParam('date_from')) {
      var dateFrom = new Date(getUrlParam('date_from') * 1000);
      extend(datepickerFromParams, {
        year: dateFrom.getFullYear(),
        month: dateFrom.getMonth() + 1,
        day: dateFrom.getDate(),
      });
    }
    new Datepicker(ge('logs_date_from'), datepickerFromParams);

    var dateTo = getUrlParam('date_to') ? new Date(getUrlParam('date_to') * 1000) : new Date();
    new Datepicker(ge('logs_date_to'), {
      mode: 'd',
      width: 190,
      pastActive: true,
      year: dateTo.getFullYear(),
      month: dateTo.getMonth() + 1,
      day: dateTo.getDate(),
      onUpdate: LogsFunctions.loadByFilters.pbind()
    });
  },
  initInputs: function() {
    // Init search by id
    var objectId = getUrlParam('object_id') || '';
    val('search_by_id', objectId);

    // Init search by text
    var text = getUrlParam('text') || '';
    val('search_by_text', text);
  },
  initAdminsSelect: function() {
    var adminId = getUrlParam('admin_id') || 0;
    var selectData = cur.admins;
    selectData[0] = {id: '0', name: 'Все'};

    GeodbPage.addSingleSelect('admin_select', selectData, {
      selectedItem: adminId,
      defaultItems: [],
      dark: true,
      width: 190,
      onChange: LogsFunctions.loadByFilters.pbind()
    });
  },

  loadNextLogsOnScroll: function() {
    if (!LogsFunctions.loadLock && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) { // 1000 is just as big number - quarter of page for me
      LogsFunctions.loadLock = true;

      var params = extend(LogsFunctions.getFilterParams(), { act: 'logs', page: ++LogsFunctions.pageCounter, only_rows: true });
      ajax.post('geodb', params, {
        onDone: function(logs) {
          var tableBody = geByTag1('tbody', ge('geodb_logs_table'));
          if (logs.length !== 0) {
            tableBody.innerHTML += logs.join('');
            LogsFunctions.loadLock = false;
          } else {
            LogsFunctions.loadLock = true; // Ban loading new logs
          }
        },
        onFail: showDoneBox.pbind(),
        showProgress: show.pbind('autoload_progress'),
        hideProgress: hide.pbind('autoload_progress'),
      });
    }
  },
  loadByFilters: function() {
    LogsFunctions.pageCounter = 0;
    LogsFunctions.loadLock = false;

    var filterParams = LogsFunctions.getFilterParams();
    GeodbPage.updateUrl(filterParams);

    var ajaxParams = extend(filterParams, {  act: 'logs', page: ++LogsFunctions.pageCounter, only_rows: true });
    ajax.post('geodb', ajaxParams, {
      onDone: function(logs) {
        geByTag1('tbody', ge('geodb_logs_table')).innerHTML = logs ? logs.join('') : '';
      },
      onFail: showDoneBox.pbind(),
      showProgress: GeodbPage.showLoader.pbind(),
      hideProgress: GeodbPage.hideLoader.pbind(),
    });
  },
  loadByFiltersOnInputChange: function() {
     clearTimeout(LogsFunctions.inputChangedTimeout);
     LogsFunctions.inputChangedTimeout = setTimeout(LogsFunctions.loadByFilters, 500);
  },
  getFilterParams: function() {
    return {
      date_from:  GeodbPage.isFilterSectionActive('logs_date_from_wrap') ? val('logs_date_from') : null,
      date_to:    GeodbPage.isFilterSectionActive('logs_date_to_wrap')   ? val('logs_date_to')   : null,
      object_id:  GeodbPage.isFilterSectionActive('search_by_id_wrap')   ? val('search_by_id')   : null,
      text:       GeodbPage.isFilterSectionActive('search_by_text_wrap') ? val('search_by_text') : null,
      admin_id:   GeodbPage.isFilterSectionActive('admin_select_wrap')   ? val('admin_select')   : null,
    };
  },
};

try { stManager.done('admin/geodb/logs.js'); } catch (e) { }
