SchoolsFunctions = {
  showRenameSchoolsBox: function(schoolRows) {
    GeodbPage.showRenameActionBox(schoolRows, getLang('edit_rename_schools'), getLang('edit_schools'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_schools',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeSchoolsBox: function(mainSchool) {
    GeodbPage.showMergeActionBox(mainSchool, 'Склеить школы', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_schools', main_school_id: mainId, clone_school_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteSchoolsBox: function(schoolRows) {
    GeodbPage.deleteAction(schoolRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_schools', school_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateSchoolsBox: function() {
    var options = {title: getLang('edit_add_schools'), width: 300},
      content = cur.createSchoolsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var schoolNames = GeodbPage.getNamesFromTextArea('new_school_names'),
        cityId = cur.cityId;

      ajax.post('geodb.php', {
        act: 'a_create_schools',
        school_names: schoolNames,
        city_id: cityId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getSchoolInfo: function(schoolId) {
    GeodbPage.addObjectInfo(schoolId, function(callback) {
      ajax.post('geodb', { act: 'a_get_school_info', school_id: schoolId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveSchoolsBox: function(schoolRows) {
    var options = {title: getLang('edit_move_schools'), width: 350},
      content = cur.moveSchoolsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var schoolIds = val('schools_select').split(','),
        cityId = val('city_select');

      if (cityId && schoolIds) {
        ajax.post('geodb', {
          act: 'a_move_schools',
          school_ids: schoolIds,
          city_id: cityId
        }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(schoolRows)));
      } else {
        GeodbPage.showError('Please, select schools and a city');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('schools_select', schoolRows);

    var cityId = cur.cityId,
      countryId = cur.countryId;

    var citySelect = new CitySelect(ge('city_select'), ge('city_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      city: cityId,
      dark: true,
    });
    new CountrySelect(ge('country_select'), ge('country_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      citySelect: citySelect,
      autocomplete: true,
      dark: true,
    });
  },

  toggleApprove: function(schoolId) {
    var row = GeodbPage.getObjectRow(schoolId);
    if (GeodbPage.isRowBold(row)) {
      SchoolsFunctions.unapprove([row]);
    } else {
      SchoolsFunctions.approve([row]);
    }
  },

  approve: function(schoolRows) {
    var schoolIds = GeodbPage.getObjectIdsFromRows(schoolRows);
    ajax.post('geodb.php', { act: 'a_approve_schools', school_ids: schoolIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.boldRows.pbind(schoolRows)));
  },

  unapprove: function(schoolRows) {
    var schoolIds = GeodbPage.getObjectIdsFromRows(schoolRows);
    ajax.post('geodb.php', { act: 'a_unapprove_schools', school_ids: schoolIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.unboldRows.pbind(schoolRows)));
  },

  // Specific
  convertToUniversity: function(schoolId) {
    ajax.post('geodb.php', {
      act: 'a_convert_school_to_university',
      school_id: schoolId
    }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.disableRowsById.pbind([schoolId])));
  },
};

try {
  stManager.done('admin/geodb/schools.js');
} catch (e) {
}
