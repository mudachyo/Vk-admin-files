ChairsFunctions = {
  showRenameChairsBox: function(chairRows) {
    GeodbPage.showRenameActionBox(chairRows, getLang('edit_rename_chairs'), getLang('edit_chairs'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_chairs',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeChairsBox: function(mainChair) {
    GeodbPage.showMergeActionBox(mainChair, 'Ñךכוטעü ךאפוהנû', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_chairs', main_chair_id: mainId, clone_chair_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteChairsBox: function(chairRows) {
    GeodbPage.deleteAction(chairRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_chairs', chair_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateChairsBox: function() {
    var options = {title: getLang('edit_add_chairs'), width: 300},
      content = cur.createChairsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var chairNames = GeodbPage.getNamesFromTextArea('new_chair_names'),
        facultyId = getUrlParam('f_id');

      ajax.post('geodb.php', {
        act: 'a_create_chairs',
        chair_names: chairNames,
        faculty_id: facultyId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getChairInfo: function(chairId) {
    GeodbPage.addObjectInfo(chairId, function(callback) {
      ajax.post('geodb', { act: 'a_get_chair_info', chair_id: chairId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveChairsBox: function(chairRows) {
    var options = {title: getLang('edit_move_chairs'), width: 350},
      content = cur.moveChairsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var chairIds = val('chairs_select').split(','),
        facultyId = val('faculty_select');

      if (facultyId && chairIds) {
        ajax.post('geodb', { act: 'a_move_chairs', chair_ids: chairIds, faculty_id: facultyId }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(chairRows)));
      } else {
        GeodbPage.showError('Please, select chairs and an faculty');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('chairs_select', chairRows);

    var facultyId = cur.facultyId,
      universityId = cur.universityId,
      cityId = cur.cityId,
      countryId = cur.countryId;

    var facultySelect = new FacultySelect(ge('faculty_select'), ge('faculty_select_row'), {
      width: 200,
      autocomplete: true,
      university: universityId,
      faculty: facultyId
    });
    var universitySelect = new UniversitySelect(ge('university_select'), ge('university_select_row'), {
      width: 200,
      autocomplete: true,
      city: cityId,
      university: universityId,
      facultySelect: facultySelect
    });
    var citySelect = new CitySelect(ge('city_select'), ge('city_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      city: cityId,
      universitySelect: universitySelect
    });
    new CountrySelect(ge('country_select'), ge('country_select_row'), {
      width: 200,
      autocomplete: true,
      country: countryId,
      citySelect: citySelect
    });
  },

  toggleApprove: function(chairId) {
    var row = GeodbPage.getObjectRow(chairId);
    if (GeodbPage.isRowBold(row)) {
      ChairsFunctions.unapprove([row]);
    } else {
      ChairsFunctions.approve([row]);
    }
  },

  approve: function(chairRows) {
    var chairIds = GeodbPage.getObjectIdsFromRows(chairRows);
    ajax.post('geodb.php', { act: 'a_approve_chairs', chair_ids: chairIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.boldRows.pbind(chairRows)));
  },

  unapprove: function(chairRows) {
    var chairIds = GeodbPage.getObjectIdsFromRows(chairRows);
    ajax.post('geodb.php', { act: 'a_unapprove_chairs', chair_ids: chairIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.unboldRows.pbind(chairRows)));
  },
};

try {
  stManager.done('admin/geodb/chairs.js');
} catch (e) {
}
