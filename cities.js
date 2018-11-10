CitiesFunctions = {
  showRenameCitiesBox: function(cityRows) {
    GeodbPage.showRenameActionBox(cityRows, getLang('edit_rename_cities'), getLang('edit_cities'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_cities',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeCitiesBox: function(mainObjectId) {
    GeodbPage.showMergeActionBox(mainObjectId, getLang('edit_merge_cities'), function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_cities', main_city_id: mainId, clone_city_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteCitiesBox: function(cityRows) {
    GeodbPage.deleteAction(cityRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_cities', city_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateCitiesBox: function() {
    var options = { title: getLang('edit_add_cities'), width: 300 },
     content = cur.createCitiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var city_names = GeodbPage.getNamesFromTextArea('new_city_names'),
        country_id = getUrlParam('cn_id');

      ajax.post('geodb.php', { act: 'a_create_cities', city_names: city_names, country_id: country_id }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });

    var cityTypeCity = 1;
    GeodbPage.addSingleSelect('objects_select', cur.cityTypes, {
      selectedItem: cityTypeCity,
      width: options.width - 50
    });
  },

  getCityInfo: function(cityId) {
    GeodbPage.addObjectInfo(cityId, function(callback) {
      ajax.post('geodb', { act: 'a_get_city_info', c_id: cityId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveCitiesBox: function(cityRows) {
    var options = { title: getLang('edit_move_cities'), width: 350 },
      content = cur.moveCitiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var cityIds = val('cities_select').split(','),
        regionId = val('region_select');

      ajax.post('geodb', {act: 'a_move_cities', city_ids: cityIds, region_id: regionId }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(cityRows)));
    });

    var countryId = cur.countryId;

    GeodbPage.addObjectsMultiSelect('cities_select', cityRows);
    new RegionSelect(ge('region_select_input'), ge('region_select_row'), {
      country_id: countryId,
      autocomplete: true,
    });
  },

  showChangeTypeBox: function(cityId) {
    var options = { title: "Изменить тип города", width: 350 },
      content = cur.changeTypeBoxContent.replace('{city_name}', GeodbPage.getObjectName(cityId));

    GeodbPage.showMessageBox(content, options, function() {
      var typeId = val('objects_select');
      ajax.post('geodb.php', { act: 'a_change_city_type', city_id: cityId, type_id: typeId }, GeodbPage.defaultAjaxResponseHandler());
    });

    // Initialize selects
    var cityTypeCity = 1;
    GeodbPage.addSingleSelect('objects_select', cur.cityTypes, {
      selectedItem: cityTypeCity,
    });
  },

  openUniversitiesInTabs: function(cityRows) {
    cityRows.forEach(function(row) {
      var universitiesLink = ge(row.id + '_universities');
      if (!hasClass(universitiesLink, 'empty')) {
        window.open(universitiesLink.href);
      }
    });
  },

  openStreetsInTabs: function(cityRows) {
    cityRows.forEach(function(row) {
      var streetsLink = ge(row.id + '_streets');
      if (!hasClass(streetsLink, 'empty')) {
        window.open(streetsLink.href);
      }
    });
  },

  openSchoolsInTabs: function(cityRows) {
    cityRows.forEach(function(row) {
      var schoolsLink = ge(row.id + '_schools');
      if (!hasClass(schoolsLink, 'empty')) {
        window.open(schoolsLink.href);
      }
    });
  },

  // Specific
  convertToRegion: function(cityId) {
    ajax.post('geodb', { act: 'a_convert_city_to_region', city_id: cityId }, GeodbPage.defaultAjaxResponseHandler(function() {
      GeodbPage.disableRowById(cityId);
    }));
  }
};

try{stManager.done('admin/geodb/cities.js');}catch(e){}
