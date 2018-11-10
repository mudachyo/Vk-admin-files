DistrictsFunctions = {
  showRenameDistrictsBox: function(districtRows) {
    GeodbPage.showRenameActionBox(districtRows, getLang('edit_rename_districts'), getLang('edit_districts'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_districts',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeDistrictsBox: function(mainDistrict) {
    GeodbPage.showMergeActionBox(mainDistrict, 'Склеить районы', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_districts', main_district_id: mainId, clone_district_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteDistrictsBox: function(districtRows) {
    GeodbPage.deleteAction(districtRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_districts', district_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateDistrictsBox: function() {
    var options = {title: getLang('edit_add_districts'), width: 300},
      content = cur.createDistrictsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var districtNames = GeodbPage.getNamesFromTextArea('new_district_names'),
        cityId = cur.cityId;

      ajax.post('geodb.php', {
        act: 'a_create_districts',
        district_names: districtNames,
        city_id: cityId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getDistrictInfo: function(districtId) {
    GeodbPage.addObjectInfo(districtId, function(callback) {
      ajax.post('geodb', { act: 'a_get_district_info', district_id: districtId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveDistrictsBox: function(districtRows) {
    var options = {title: getLang('edit_move_districts'), width: 350},
      content = cur.moveDistrictsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var districtIds = val('districts_select').split(','),
        cityId = val('city_select');

      if (cityId && districtIds) {
        ajax.post('geodb', {
          act: 'a_move_districts',
          district_ids: districtIds,
          city_id: cityId
        }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(districtRows)));
      } else {
        GeodbPage.showError('Please, select districts and a city');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('districts_select', districtRows);

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
};

try {
  stManager.done('admin/geodb/districts.js');
} catch (e) {
}
