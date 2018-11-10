UniversitiesFunctions = {
  // Universities have full_name, so they have they don't use Geodb.shoRenameActionBox
  showRenameUniversitiesBox: function(universityRows) {
    var options = { title: getLang('edit_rename_unis'), width: 650, submitButtonName: getLang('edit_rename_unis'),
      replacements: {
        rows_to_rename: UniversitiesFunctions.prepareUniversityNamesForRenameBox(universityRows),
        autocorrections: GeodbPage.prepareAutocorrections(),
        objects_type: getLang('edit_universities')
      }
    };
    var content = cur.renameBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var renameRows = domQuery('[id^=rename_box_object]'),
        universityIds = [],
        universityShortNames = [],
        universityFullNames = [];

      renameRows.forEach(function(renameRow) {
        universityIds.push(renameRow.id.replace('rename_box_object', ''));
        var shortName = val(geByClass1('short_name', renameRow));
        universityShortNames.push(shortName);
        var fullName = val(geByClass1('full_name', renameRow));
        universityFullNames.push(fullName);
      });


      var translations = GeodbPage.gatherTranslations();

      ajax.post('geodb', { act: 'a_rename_universities',
        object_ids: universityIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
        university_full_names: universityFullNames,
      }, GeodbPage.defaultAjaxResponseHandler(function() {
        UniversitiesFunctions.replaceObjectNames(universityIds, universityShortNames, universityFullNames);
      }));
    });
  },

  showMergeUniversitiesBox: function(mainUniversity) {
    GeodbPage.showMergeActionBox(mainUniversity, getLang('edit_merge_universities'), function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_universities', main_university_id: mainId, clone_university_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  deleteUniversities: function(universityRows) {
    GeodbPage.deleteAction(universityRows, function(objectIds, callback) {
      ajax.post('geodb.php', { act: 'a_delete_universities', university_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateUniversitiesBox: function() {
    var options = {title: getLang('edit_add_universities'), width: 300},
      content = cur.createUniversitiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var university_names = GeodbPage.getNamesFromTextArea('new_university_names'),
        city_id = getUrlParam('c_id');

      ajax.post('geodb.php', {
        act: 'a_create_universities',
        university_names: university_names,
        city_id: city_id
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback.pbind()));
    });
  },

  getUniversityInfo: function(universityId) {
    GeodbPage.addObjectInfo(universityId, function(callback) {
      ajax.post('geodb', { act: 'a_get_university_info', university_id: universityId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveUniversitiesBox: function(universityRows) {
    var options = {title: getLang('edit_move_unis'), width: 350},
      content = cur.moveUniversitiesBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var universityIds = val('universities_select').split(','),
        cityId = val('city_select');

      if (cityId && universityIds) {
        ajax.post('geodb', {
          act: 'a_move_universities',
          university_ids: universityIds,
          new_city_id: cityId
        }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback(universityRows)));
      } else {
        GeodbPage.showError('Please, select a city');
        notaBene('city_select_row');
      }
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('universities_select', universityRows);

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

  openFacultiesInTabs: function(universityRows) {
    universityRows.forEach(function(row) {
      if (!hasClass(GeodbPage.getObjectNameElement(GeodbPage.getObjectIdFromRow(row)), 'empty')) {
        var facultiesUrl = GeodbPage.getObjectNameElement(GeodbPage.getObjectIdFromRow(row)).href;
        window.open(facultiesUrl);
      }
    });
  },

  showDeleteFacultiesDialog: function(universityRows) {
    var universitiesAmount = universityRows.length,
      totalFacultiesAmount = UniversitiesFunctions.countFacultiesAmount(universityRows);

    var content = 'Точно удалить ' + totalFacultiesAmount + ' факультетов в ' + universitiesAmount + ' вузах?'; // Todo: Add declension
    GeodbPage.showAreYouSureDialog(content, function() {
      var universityIds = universityRows.map(function(row) {
        return GeodbPage.getObjectIdFromRow(row)
      });
      ajax.post('geodb.php', { act: 'a_delete_faculties_in_universities', university_ids: universityIds }, GeodbPage.defaultAjaxResponseHandler("Факультеты в университетах поставлены в очередь на удаление"));
    });
  },

  // Specific
  convertToSchool: function(universityId) {
    ajax.post('geodb.php', {
      act: 'a_convert_university_to_school',
      university_id: universityId
    }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.disableRowsById.pbind([universityId])));
  },

  // Helpers
  countFacultiesAmount: function(universityRows) {
    var totalFacultiesAmount = 0;
    universityRows.forEach(function(row) {
      var facultiesAmount = parseInt(cur.facultiesAmountMap[GeodbPage.getObjectIdFromRow(row)]);
      if (!facultiesAmount) facultiesAmount = 0;
      totalFacultiesAmount += facultiesAmount;
    });
    return totalFacultiesAmount;
  },

  prepareUniversityNamesForRenameBox(universityRows) {
    var universityRenameRows = '';
    universityRows.forEach(function(row) {
      var objectId = GeodbPage.getObjectIdFromRowId(row.id),
        shortName = val(GeodbPage.getObjectNameElement(objectId)) || '',
        fullName = val(GeodbPage.getObjectFullNameElement(objectId)) || '';

      universityRenameRows += cur.universityRenameRow.split('{objectId}').join(objectId).replace('{shortName}', shortName).replace('{fullName}', fullName);
    });
    return universityRenameRows;
  },

  replaceObjectNames(universityIds, universityShortNames, universityFullNames) {
    for (var i = 0; i < universityIds.length; i++) {
      var universityId = universityIds[i];
      GeodbPage.replaceObjectName(universityId , universityShortNames[i]);
      val(ge(GeodbPage.getObjectRowId(universityId) + '_fullname'), universityFullNames[i]); // replace Full name
    }
  }
};

try {
  stManager.done('admin/geodb/universities.js');
} catch (e) {
}
