StreetsFunctions = {
  showRenameStreetsBox: function(streetRows) {
    GeodbPage.showRenameActionBox(streetRows, getLang('edit_rename_streets'), getLang('edit_streets'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_streets',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeStreetsBox: function(mainStreet) {
    GeodbPage.showMergeActionBox(mainStreet, 'Склеить улицы', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_streets', main_street_id: mainId, clone_street_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteStreetsBox: function(streetRows) {
    GeodbPage.deleteAction(streetRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_streets', street_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateStreetsBox: function() {
    var options = {title: getLang('edit_add_streets'), width: 300},
      content = cur.createStreetsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var streetNames = GeodbPage.getNamesFromTextArea('new_street_names'),
        cityId = cur.cityId;

      ajax.post('geodb.php', {
        act: 'a_create_streets',
        street_names: streetNames,
        city_id: cityId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback()));
    });
  },

  getStreetInfo: function(streetId) {
    GeodbPage.addObjectInfo(streetId, function(callback) {
      ajax.post('geodb', { act: 'a_get_street_info', street_id: streetId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveStreetsBox: function(streetRows) {
    var options = {title: getLang('edit_move_streets'), width: 350},
      content = cur.moveStreetsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var streetIds = val('streets_select').split(','),
        cityId = val('city_select');

      if (cityId && streetIds) {
        ajax.post('geodb', {
          act: 'a_move_streets',
          street_ids: streetIds,
          city_id: cityId
        }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(streetRows)));
      } else {
        GeodbPage.showError('Please, select streets and a city');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('streets_select', streetRows);

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

  toggleApprove: function(streetId) {
    var row = GeodbPage.getObjectRow(streetId);
    if (GeodbPage.isRowBold(row)) {
      StreetsFunctions.unapprove([row]);
    } else {
      StreetsFunctions.approve([row]);
    }
  },

  approve: function(streetRows) {
    var streetIds = GeodbPage.getObjectIdsFromRows(streetRows);
    ajax.post('geodb.php', { act: 'a_approve_streets', street_ids: streetIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.boldRows.pbind(streetRows)));
  },

  unapprove: function(streetRows) {
    var streetIds = GeodbPage.getObjectIdsFromRows(streetRows);
    ajax.post('geodb.php', { act: 'a_unapprove_streets', street_ids: streetIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.unboldRows.pbind(streetRows)));
  },
};

try {
  stManager.done('admin/geodb/streets.js');
} catch (e) {
}
