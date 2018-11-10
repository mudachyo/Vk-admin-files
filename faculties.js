FacultiesFunctions = {
  showRenameFacultiesBox: function(facultyRows) {
    GeodbPage.showRenameActionBox(facultyRows, getLang('edit_rename_faculties'), getLang('edit_faculties'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_faculties',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeFacultiesBox: function(mainFaculty) {
    GeodbPage.showMergeActionBox(mainFaculty, 'Склеить факультеты', function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_faculties', main_faculty_id: mainId, clone_faculty_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteFacultiesBox: function(facultyRows) {
    GeodbPage.deleteAction(facultyRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_faculties', faculty_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateFacultiesBox: function() {
    var options = {title: getLang('edit_add_faculties'), width: 300},
      content = cur.createFacultiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var faculty_names = GeodbPage.getNamesFromTextArea('new_faculty_names'),
        university_id = getUrlParam('u_id');

      ajax.post('geodb.php', {
        act: 'a_create_faculties',
        faculty_names: faculty_names,
        university_id: university_id
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getFacultyInfo: function(facultyId) {
    GeodbPage.addObjectInfo(facultyId, function(callback) {
      ajax.post('geodb', { act: 'a_get_faculty_info', faculty_id: facultyId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveFacultiesBox: function(facultyRows) {
    var options = {title: getLang('edit_move_faculties'), width: 350},
      content = cur.moveFacultiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var facultyIds = val('faculties_select').split(','),
        universityId = val('university_select');

      if (universityId && facultyIds) {
        ajax.post('geodb', { act: 'a_move_faculties', faculty_ids: facultyIds, university_id: universityId }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(facultyRows)));
      } else {
        GeodbPage.showError('Please, select faculties and a university');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('faculties_select', facultyRows);

    var universityId = cur.universityId,
      cityId = cur.cityId,
      countryId = cur.countryId;

    var universitySelect = new UniversitySelect(ge('university_select'), ge('university_select_row'), {
      width: 200,
      autocomplete: true,
      city: cityId,
      university: universityId,
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

  toggleApprove: function(facultyId) {
    var row = GeodbPage.getObjectRow(facultyId);
    if (GeodbPage.isRowBold(row)) {
      FacultiesFunctions.unapprove([row]);
    } else {
      FacultiesFunctions.approve([row]);
    }
  },

  approve: function(facultyRows) {
    var facultyIds = GeodbPage.getObjectIdsFromRows(facultyRows);
    ajax.post('geodb.php', { act: 'a_approve_faculties', faculty_ids: facultyIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.boldRows.pbind(facultyRows)));
  },

  unapprove: function(facultyRows) {
    var facultyIds = GeodbPage.getObjectIdsFromRows(facultyRows);
    ajax.post('geodb.php', { act: 'a_unapprove_faculties', faculty_ids: facultyIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.unboldRows.pbind(facultyRows)));
  },

  // Specific
  openChairsInTabs: function(facultyRows) {
    facultyRows.forEach(function(row) {
      var nameElement = GeodbPage.getObjectNameElement(GeodbPage.getObjectIdFromRow(row));
      if (!hasClass(nameElement, 'empty')) {
        var chairsUrl = nameElement.href;
        window.open(chairsUrl);
      }
    });
  },
};

try {
  stManager.done('admin/geodb/faculties.js');
} catch (e) {
}
