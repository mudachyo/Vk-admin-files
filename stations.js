StationsFunctions = {
  showRenameStationsBox: function(stationRows) {
    GeodbPage.showRenameActionBox(stationRows, getLang('edit_rename_stations'), getLang('edit_rename_stations'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_stations',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeStationsBox: function(mainStation) {
    GeodbPage.showMergeActionBox(mainStation, 'Склеить станции', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_stations', main_station_id: mainId, clone_station_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteStationsBox: function(stationRows) {
    GeodbPage.deleteAction(stationRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_stations', station_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateStationsBox: function() {
    var options = {title: getLang('edit_add_stations'), width: 300},
      content = cur.createStationsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var stationNames = GeodbPage.getNamesFromTextArea('new_station_names'),
        cityId = cur.cityId;

      ajax.post('geodb.php', {
        act: 'a_create_stations',
        station_names: stationNames,
        city_id: cityId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getStationInfo: function(stationId) {
    GeodbPage.addObjectInfo(stationId, function(callback) {
      ajax.post('geodb', { act: 'a_get_station_info', station_id: stationId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveStationsBox: function(stationRows) {
    var options = {title: getLang('edit_move_stations'), width: 350},
      content = cur.moveStationsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var stationIds = val('stations_select').split(','),
        cityId = val('city_select');

      if (cityId && stationIds) {
        ajax.post('geodb', {
          act: 'a_move_stations',
          station_ids: stationIds,
          city_id: cityId
        }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(stationRows)));
      } else {
        GeodbPage.showError('Please, select stations and a city');
      }
    });

    GeodbPage.addObjectsMultiSelect('stations_select', stationRows);

    var cityId = cur.cityId,
      countryId = cur.countryId;

    var citySelect = new CitySelect(ge('city_select'), ge('city_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      city: cityId,
    });
    new CountrySelect(ge('country_select'), ge('country_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      citySelect: citySelect
    });
  },

  showApproveStationsBox: function(stationRows) {
    var options = {title: getLang('edit_approve_stations'), width: 350},
      content = cur.approveBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var stationIds = val('objects_select').split(',');
      ajax.post('geodb.php', {
        act: 'a_approve_stations',
        station_ids: stationIds
      }, GeodbPage.defaultAjaxResponseHandler(function() {
        GeodbPage.boldRows(stationRows);
      }));
    });

    GeodbPage.addObjectsMultiSelect('objects_select', stationRows);
  },

  approveStations: function(stationRows) {
    GeodbPage.approveRows(stationRows, function(stationIds, callback) {
      ajax.post('geodb.php', { act: 'a_approve_stations', station_ids: stationIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  }
};

try {
  stManager.done('admin/geodb/stations.js');
} catch (e) {
}
