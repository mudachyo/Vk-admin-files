var Restore2={valLastName:function(e,t){val("new_last_name"+e,t)},valName:function(e,t){var o=val(e).split(" ");val("new_first_name"+t,o[0]),val("new_last_name"+t,o[1])},getPage:function(e){show("progress_top","progress_bottom");var t=nav.objLoc;return t.offset=e,nav.go(t),!1},initButtons:function(e){e=e||cur.requests;for(var t=0;t<e.length;++t){var o=e[t];createButton("button_accept_"+o,Restore2.processRequest.pbind(o,3)),createButton("button_reject_"+o,Restore2.processRequest.pbind(o,2)),createButton("button_postpone_"+o,Restore2.processRequest.pbind(o,1)),Restore2.updateUsedTemp(o)}cur.restore2_tab_hash=curNotifier.instance_id||vk.ts;var s=function(e){each(e,function(e,t){ls.remove(cur.restore2_tab_hash+"aa_ids_added"+t)}),delete cur.restore2_tab_hash};addEvent(window,"beforeunload",s.pbind(e)),cur.destroy.push(s.pbind(e)),Notifier.addRecvClbk("restore2UpdateDayNum",0,Restore2.updateDayNumCounter,!0)},addToBadRequests:function(e,t,o){hide(e),ajax.post("/restore2",{act:"add_bad_request",rid:t,hash:o},{showProgress:showProgress.pbind("restore_add_to_bad_requests_progress"+t),hideProgress:hideProgress.pbind("restore_add_to_bad_requests_progress"+t),onDone:function(e){var o="request"+t;val(o,e),addClass(o,"restore2_bad_request_added"),removeClass(o,"new_request")}})},showMore:function(e){var t=geByClass("new_request").length;if(!(t>=5)||e){cur.offset=1==cur.with_lock?0:t;var o=extend({},nav.objLoc);delete o[0],o.act="a_requests_more",o.offset=cur.offset,o.already_on_page=geByClass("request_row").length,ajax.post("restore2",o,{onDone:function(e,t){var o=ce("div",{innerHTML:e}),s=ge("requests"),a=geByClass1("pagesBottom",s);for(var r in t){var n=t[r],i=ge("request"+n);i?slideUp(i,100,re.pbind(i)):cur.requests.push(parseInt(t[r]))}for(var d=[];o.children.length;){var l=o.children[0];s.insertBefore(l,a),d.push(l)}Restore2.loadDeletedPhotosInfo(d),Restore2.initButtons(t)}})}},loadChangeNameHistory:function(e,t,o){if(!hasClass(o,"change_name_loading")){var s=val("change_name_rows"+e);ajax.post("restore2",{act:"a_change_name_history",mid:t,rid:e},{showProgress:addClass.pbind(o,"change_name_loading"),hideProgress:removeClass.pbind(o,"change_name_loading"),onDone:function(t){val("change_name_rows"+e,t),val("change_name_short_history"+e,s)}})}},loadChangePhoneHistory:function(e,t,o){if(!hasClass(o,"change_name_loading")){var s=val("phone_change_rows"+e);ajax.post("restore2",{act:"change_phone_history",mid:t,rid:e},{showProgress:addClass.pbind(o,"change_name_loading"),hideProgress:removeClass.pbind(o,"change_name_loading"),onDone:function(t){val("phone_change_rows"+e,t),val("phone_change_rows_short"+e,s)}})}},collapseChangePhoneHistory:function(e){var t=val("phone_change_rows_short"+e);val("phone_change_rows"+e,t)},collapseChangeNameHistory:function(e){var t=val("change_name_short_history"+e);val("change_name_rows"+e,t)},resendAuthData:function(e,t,o){ajax.post("restore2",{act:"a_resend_auth_data",request_id:t,hash:o},{onDone:function(t){e.outerHTML=t}})},forceFastAccept:function(e,t,o){ajax.post("restore2",{act:"a_force_fast_accept",request_id:t,hash:o},{onDone:function(t){e.outerHTML=t}})},resetPhoneLimit:function(e,t,o){ajax.post("restore2",{act:"a_reset_phone_limit",request_id:t,hash:o},{onDone:function(t){e.outerHTML=t}})},processRequest:function(e,t){if(!isVisible("progress"+e)){var o=ge("comment"+e),s=trim(val(o)),a=o.getAttribute("data-def")||"";if(a.length&&a.indexOf(s)>=0&&(s=""),(1==t||2==t)&&!s.length)return notaBene(o);if(cur.dblClickBtn&&cur.dblClickNum<1)return cur.dblClickNum+=1,Restore2.showUsedText(e);cur.dblClickBtn=!1;var r=ge("request"+e),n=cur.restore2_tab_hash+"aa_ids_added"+e,i=ls.get(n);ls.remove(n),ajax.post("restore2",{act:"a_process",aa_ids:i,is_en:attr("autoanswers"+e,"data-is_en"),is_mob:attr("autoanswers"+e,"data-is_mob"),rid:e,hash:val("hash"+e),result:t,comment:s,images:ge("comment_attachs"+e).getAttribute("images-ids")},{onDone:function(e,t){val(r,e),addClass(r,"request_processed"),removeClass(r,"new_request"),Restore2.showMore(),window.scroll(0,r.offsetTop-20),Restore2.updateDayNumCounter({counter:t},!0)},showProgress:show.pbind("progress"+e),hideProgress:hide.pbind("progress"+e)})}},restoreRequest:function(e,t,o,s){return ajax.post("restore2",{act:"a_request_restore",rid:t,hash:o,cancelled_by_owner:s||!1},{showProgress:addClass.pbind(e,"processing"),hideProgress:removeClass.pbind(e,"processing"),onDone:function(e,o){cur.requests=o;var s=se(e),a=ge("requests"),r=ge("request"+t);r?a.replaceChild(s,r):a.appendChild(s),Restore2.initButtons([t]),Restore2.loadDeletedPhotosInfo(s)}}),!1},noOnlineCheckedRequest:function(e,t,o){ajax.post("restore2",{act:"a_set_no_online_checked",request_id:t,hash:o},{showProgress:addClass.pbind(e,"processing"),hideProgress:removeClass.pbind(e,"processing"),onDone:function(e){var o=ge("request"+t);addClass(o,"request_processed"),removeClass(o,"new_request"),val(o,e),Restore2.showMore(),window.scroll(0,o.offsetTop-20)}})},takeRequest:function(e,t,o){return ajax.post("restore2",{act:"a_take_request",rid:t,hash:o},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e),onDone:function(e){var o=ge("request"+t);addClass(o,"request_processed"),removeClass(o,"new_request"),val(o,e),window.scroll(0,o.offsetTop-20)}}),!1},replaceNameValues:function(e){var t=val("new_first_name"+e),o=val("new_last_name"+e);val("new_first_name"+e,o),val("new_last_name"+e,t)},changeName:function(e,t){ajax.post("restore2",{act:"a_change_surname",user_id:e,new_first:val("new_first_name"+e),new_last:val("new_last_name"+e),hash:t},{onDone:function(t){var o=ge("maiden_name"+e);o&&(t+=o.outerHTML),val("user_name"+e,t)},showProgress:function(){show("progress_check")},hideProgress:function(){hide("progress_check")}})},removeMaidenName:function(e,t,o){return ajax.post("restore2",{act:"a_remove_maiden_name",id:t,hash:o},{onDone:function(){re(e),re("maiden_name"+t)},showProgress:addClass.pbind(e,"processing"),hideProgress:removeClass.pbind(e,"processing")}),!1},changeLang:function(e,t,o){if(cancelEvent(o),attr("autoanswers"+e,"data-is_en",t),1==t){hide("request_dialog_lang_en_"+e),show("request_dialog_lang_ru_"+e);var s=cur.hello_ru,a=cur.hello_en}else{show("request_dialog_lang_en_"+e),hide("request_dialog_lang_ru_"+e);var a=cur.hello_ru,s=cur.hello_en}var r=val("comment"+e),n=attr("comment"+e,"data-def");val("comment"+e,r.replace(s,a)),attr("comment"+e,"data-def",n.replace(s,a)),Restore2.updateUsedTemp(e)},changeAATemplate:function(e,t){attr("autoanswers"+e,"data-is_mob",t),t?(hide("request_dialog_change_mobile_template_"+e),show("request_dialog_change_desktop_template_"+e)):(show("request_dialog_change_mobile_template_"+e),hide("request_dialog_change_desktop_template_"+e)),Restore2.updateUsedTemp(e)},showUsedText:function(e){var t="autoanswer_form_used"+e,o=ge(t);o.timeout&&clearTimeout(o.timeout),show(t),o.timeout=setTimeout(hide.pbind(t),1e4)},checkAAids:function(e,t){var o=attr("autoanswers"+e,"data-aa_ids"),s=attr("autoanswers"+e,"data-is_mob"),a=attr("autoanswers"+e,"data-is_en"),r=ls.get(cur.restore2_tab_hash+"aa_ids_added"+e);if(cur.dblClickBtn=!1,cur.dblClickNum=0,hide("autoanswer_form_used"+e),each(o.split("|"),function(o,r){if(r){r=r.split(":");var n=r[1].split(",");if(3==n[0].split("/").length&&-1!==n.indexOf(t+"/"+a+"/"+s)||-1!==n.indexOf(t+"/"+a)&&0==s){var i="restore_cmt"+r[0],d=ge(i);d.timeout&&clearTimeout(d.timeout),addClass(i,"restore2_aa_used"),d.timeout=setTimeout(removeClass.pbind(i,"restore2_aa_used"),1e4),cur.dblClickBtn=!0,Restore2.showUsedText(e)}}}),r){var n=r.split(",");(3==n[0].split("/").length&&-1!==n.indexOf(t+"/"+a+"/"+s)||-1!==n.indexOf(t+"/"+a)&&0==s)&&(cur.dblClickBtn=!0,Restore2.showUsedText(e))}},updateUsedTemp:function(e){if(ge("autoanswers"+e)){var t=attr("autoanswers"+e,"data-is_en"),o=attr("autoanswers"+e,"data-is_mob"),s=ls.get(cur.restore2_tab_hash+"aa_ids_added"+e),a=attr("autoanswers"+e,"data-aa_ids");s=s?s.split(","):[],each(a.split("|"),function(e,t){t&&(t=t.split(":"),each(t[1].split(","),function(e,t){s.push(t)}))});var r=geByClass("autoanswer_link_color","request"+e);each(r,function(e,t){removeClass(t,"restore2_aa_tab_used")}),each(s,function(s,a){if(a=a.split("/"),a[1]==t&&(!a[2]&&0==o||a[2]==o)){var a=geByClass1("autoanswer_"+a[0],"request"+e);addClass(a,"restore2_aa_tab_used")}})}Restore2.updateMobileTemp(e)},updateMobileTemp:function(e){if(ge("autoanswers"+e)){var t=attr("autoanswers"+e,"data-is_en"),o=attr("autoanswers"+e,"data-is_mob"),s=geByClass("autoanswer_link_color","autoanswers"+e);each(s,function(e,s){var a=intval(s.className.replace(/(.+)autoanswer_([0-9]+)/gi,"$2")),r=cur.autoanswers[a];if(1==o)var n=1==t?r[5]:r[4];else var n=1==t?r[3]:r[1];n?show(s):hide(s)})}},changeAATab:function(e,t){hasClass(e,"active")||(1==t?(hide("desktop_templates"),show("mobile_templates"),hide("desktop_images"),show("mobile_images"),removeClass("show_template_desktop","active"),addClass(e,"active")):(show("desktop_templates"),hide("mobile_templates"),show("desktop_images"),hide("mobile_images"),removeClass("show_template_mobile","active"),addClass(e,"active")),cur.mobileAATemplate=t)},autoanswer:function(e,t,o){var s=intval(t.parentNode.id.replace(/[^0-9]/g,"")),a=ge("comment"+s),r=attr("autoanswers"+s,"data-is_en"),n=attr("autoanswers"+s,"data-is_mob"),i=ge("comment_attachs"+s),d=a.getAttribute("data-def")||"",l=cur.autoanswers[o],_=1==n?l[6]:l[2],u=val(a),c=cur.restore2_tab_hash+"aa_ids_added"+s,h=[];if(0!=r&&(0==n&&l[3]||l[5]))var p=0!=n?l[5]:l[3];else var p=0!=n?l[4]:l[1];var m=winToUtf(p.replace(/<br>/g,"\n"));if((a.last_aid!=o||(e.ctrlKey||e.metaKey||e.altKey)&&u)&&(a.last_aid=o,Restore2.checkAAids(s,o)),0==m.indexOf("Hello!")&&(d=""),(e.ctrlKey||e.metaKey||e.altKey)&&u){u=trim(u.replace(/(^|\s)#[a-zA-Z0-9][\w-]*\b/g,"$1")),val(a,u+"\n\n"+m);var g=ls.get(c);g&&(h=g.split(","))}else val(a,d+m),i.setAttribute("images-ids",_),_?(show(i),val(geByClass1("request_dialog_form_attachs_count",i),_.split(",").length)):hide(i);h.push(o+"/"+r+"/"+n),ls.set(c,h.join(",")),elfocus(a)},showMessageAttachs:function(e,t){slideUp(e),slideDown(t)},removeAnswerAttachs:function(e){var t=ge("comment_attachs"+e);t.setAttribute("images-ids",""),hide(t)},unlockRequests:function(e,t,o){ajax.post("restore2",{act:"a_unlock_requests",admin:t,hash:o},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e)})},memberInfoTT:function(e,t,o){showTooltip(e,{url:"meminfo",params:{act:"load_card_comments",mid:t,hash:o},slide:15,className:"restore2_member_info_tt member_info_tt",shift:[0,0,10],hasover:1,forcetodown:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},banInfoTT:function(e,t,o,s,a){showTooltip(e,{url:"restore2",params:{act:"load_ban_info",typ:t,id:o,rid:s,hash:a},slide:15,className:"restore2_binfo_tt",center:!0,dir:"top",hasover:1,forcetodown:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},notifyNospam:function(e,t,o,s){ajax.post("restore2",{act:"a_notify_nospam",admin_id:t,rid:o,hash:s},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e),onDone:function(t){var o=se(t);domReplaceEl(e,o)}})},banCommentTT:function(e,t,o,s){showTooltip(e,{url:"restore2",params:{act:"load_ban_comment",id:t,mid:o,hash:s},className:"restore2_binfo_tt",center:!0,dir:"top",forcetodown:1,showdt:200,hidedt:200,no_shadow:!0})},avatarsTT:function(e,t,o){showTooltip(e,{dir:"top",url:"restore2",params:{act:"load_avatars",id:t,hash:o},slide:15,className:"restore2_tt restore2_photos_tt",shift:function(){var t=(Math.round(getSize(e)[0]),Math.round(getSize(ge("content"))[0]),(getXY(domPN(e))[0]-getXY(ge("content"))[0])/2);return[t,0,10]},forcetodown:1,hasover:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},checkedPhotosTT:function(e,t,o,s){showTooltip(e,{url:"restore2",params:{act:"load_checked_photos",id:t,rid:o,hash:s},slide:15,className:"restore2_tt restore2_photos_tt",shift:function(){var t,o=Math.round(getSize(e.tt.container)[0]),s=Math.round(getSize(ge("content"))[0]);return t=getXY(e)[0]-o/2<getXY(ge("content"))[0]?getXY(domPN(e))[0]-getXY(ge("content"))[0]-(s-o)/2:o/2-getSize(e)[0]/2,[t,0,10]},forcetodown:1,hasover:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},privatePhotosTT:function(e,t,o,s){showTooltip(e,{url:"restore2",params:{act:"load_private_photos",id:t,rid:o,hash:s},slide:15,className:"restore2_tt restore2_photos_tt",shift:function(){var t,o=Math.round(getSize(e.tt.container)[0]),s=Math.round(getSize(ge("content"))[0]);return t=getXY(e)[0]-o/2<getXY(ge("content"))[0]?getXY(domPN(e))[0]-getXY(ge("content"))[0]-(s-o)/2:o/2-getSize(e)[0]/2,[t,0,10]},forcetodown:1,hasover:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},privateAlbumsTT:function(e,t,o){showTooltip(e,{url:"restore2",params:{act:"private_albums_tt",id:t,hash:o},slide:15,className:"restore2_tt restore2_photos_tt restore2_abums_tt",shift:function(){var t,o=Math.round(getSize(e.tt.container)[0]),s=Math.round(getSize(ge("content"))[0]);return t=getXY(e)[0]-o/2<getXY(ge("content"))[0]?getXY(domPN(e))[0]-getXY(ge("content"))[0]-(s-o)/2:o/2-getSize(e)[0]/2,[t,0,10]},forcetodown:1,hasover:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},lastWallPhotos:function(e,t,o,s){showTooltip(e,{url:"restore2?act=a_load_wall_photos",params:{id:t,hash:o,show_private:s},slide:15,className:"restore2_tt restore2_photos_tt",shift:function(){var t,o=Math.round(getSize(e.tt.container)[0]),s=Math.round(getSize(ge("content"))[0]);return t=getXY(e)[0]-o/2<getXY(ge("content"))[0]?getXY(domPN(e))[0]-getXY(ge("content"))[0]-(s-o)/2:o/2-getSize(e)[0]/2,[t,0,10]},forcetodown:1,hasover:1,toup:1,showdt:200,hidedt:200,no_shadow:!0})},repliesTT:function(e,t,o,s){showTooltip(e,{url:"restore2",params:{act:"load_message_comments",hash:t,rid:o,cid:s},slide:15,className:"restore2_tt restore2_message_comments_tt",shift:[0,0,10],forcetodown:1,hasover:1,toup:1,showdt:350,hidedt:200,no_shadow:!0})},ublGoto:function(){var e=trim(val("restore2_ubl_search_text"));nav.go({0:nav.objLoc[0],act:nav.objLoc.act,q:""!=e?e:null}),lockButton("restore2_ubl_search_btn")},_ublDone:function(e,t){curBox().hide(),showDoneBox(e),re("restore2_ubl"+cur.ublId),val("restore2_ubl_tbody",t+val("restore2_ubl_tbody"))},ublAddUser:function(){var e={id:cur.ublId,type:cur.ublTypeDD.val(),note:trim(val("restore2_ubl_form_note")),hash:cur.ublHash};return ajax.post("restore2?act=a_ubl_add_user",e,{onDone:Restore2._ublDone,progress:cur.editUblBox.progress}),!1},ublRejectUser:function(){var e={id:cur.ublId,note:trim(val("restore2_ubl_form_note")),hash:cur.ublHash};return ajax.post("restore2?act=a_ubl_reject_user",e,{onDone:Restore2._ublDone,progress:cur.rejectUblBox.progress}),!1},ublDeleteUser:function(){var e={id:cur.ublId,note:trim(val("restore2_ubl_form_note")),hash:cur.ublHash};return ajax.post("restore2?act=a_ubl_delete_user",e,{onDone:Restore2._ublDone,progress:cur.deleteUblBox.progress}),!1},showReplies:function(e,t){return showBox("restore2",{act:"replies_box",rid:e,cid:t},{params:{width:727,containerClass:"restore2_replies_box",hideButtons:!0,onDestroy:Restore2.refreshCommentsCount.pbind(e,t)}}),!1},refreshCommentsCount:function(e,t){ajax.post("restore2",{act:"load_comments_count",rid:e,cid:t},{onDone:function(o){var s=ge("restore_message_comments_"+e+"_"+t);s&&s.parentNode.replaceChild(se(o),s)}})},slideDownRequest:function(e,t){hasClass(e,"result_msg_slide_loading")||ajax.post("restore2",{act:"a_request_slide_down",rid:t},{showProgress:addClass.pbind(e,"result_msg_slide_loading"),hideProgress:removeClass.pbind(e,"result_msg_slide_loading"),onDone:function(e,o){if(e){var s=se(e),a=ge("request"+t);addClass("result_msg"+t,"result_msg_unslided"),a.className=s.className,hide(s),s.className="",s.id="result_request"+t,a.appendChild(s),slideDown(s,700),Restore2.initButtons(o),Restore2.loadDeletedPhotosInfo(s)}}})},slideUpRequest:function(e){slideUp("result_request"+e,400,function(){re("result_request"+e),removeClass("result_msg"+e,"result_msg_unslided");var t=ge("request"+e);addClass(t,"request_processed"),removeClass(t,"new_request")})},pblAdd:function(e,t){var o=trim(val("restore2_dph_text"));return o?void ajax.post("restore2",{act:"a_pbl_add_photo",raw:o,hash:t},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e),onFail:function(){val("restore2_dph_text","")}}):notaBene("restore2_dph_text")},addPhotoToBlackList:function(e,t,o){ajax.post("restore2",{act:"a_pbl_add_photo",raw:e,hash:t,noreload:1,rid:o},{onDone:function(){addClass("restore_photo_"+e,"request_message_thumb_denied"),hide("restore_photo_add_blacklist"+e),attr("restore_photo_"+e,"onmouseover","Restore2.inPblTT(this);")}})},removeIgnoredPhoto:function(e,t,o){ajax.post("restore2",{act:"a_pbl_remove_photo",id:t,hash:o},{onDone:re.pbind("restore2_ignored_photo"+t),showProgress:addClass.pbind(e,"restore2_du_remove_progress")})},openEditUblBox:function(e){cur.editUblBox=showBox("/restore2?act=edit_ubl_box",{id:e},{onDone:function(){cur.editUblBox.removeButtons(),cur.editUblBox.addButton(getLang("global_save"),Restore2.ublAddUser,"ok"),cur.ublSaveCallback=Restore2.ublAddUser}})},openRejectUblBox:function(e){cur.rejectUblBox=showBox("/restore2?act=reject_ubl_box",{id:e},{onDone:function(){cur.rejectUblBox.removeButtons(),cur.rejectUblBox.addButton(getLang("global_save"),Restore2.ublRejectUser,"ok"),cur.ublSaveCallback=Restore2.ublRejectUser}})},openDeleteUblBox:function(e){cur.deleteUblBox=showBox("/restore2?act=delete_ubl_box",{id:e},{onDone:function(){cur.deleteUblBox.removeButtons(),cur.deleteUblBox.addButton(getLang("global_delete"),Restore2.ublDeleteUser,"ok"),cur.ublSaveCallback=Restore2.ublDeleteUser}})},inPblTT:function(e){showTooltip(e,{dir:"bottom",center:1,typeClass:"tt_black",text:getLang("restore_2_photo_in_blacklist")})},pblLoadMore:function(e,t){ajax.post("restore2?act=pbl",{load:1,offset:cur.pblOffset,found_count:t},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e),onDone:function(e,t){t?cur.pblOffset=t:hide("restore2_dph_button_row"),val("restore2_dph_table_body",val("restore2_dph_table_body")+e)}})},showBans:function(e){e&&showBox("meminfo",{act:"bans",mid:e,box:1,onhide:1})},saveLimits:function(e,t){ajax.post("restore2",{act:"a_save_limits",hash:t,create_x:val("restore2_lim1_x"),create_y:val("restore2_lim1_y"),edit_x:val("restore2_lim2_x"),edit_y:val("restore2_lim2_y"),admin_delay:val("restore2_lim_admin_delay")},{showProgress:lockButton.pbind(e),hideProgress:unlockButton.pbind(e),onDone:function(e,t){showDoneBox(e);var o=ge("restore2_limits_logs");o&&o.parentNode.replaceChild(se(t),o)}})},showAdminsRightTT:function(e,t){showTooltip(e,{text:val("restore2_admins_tt_value_"+t),slideX:15,className:"restore2_admins_tt right",shift:[235,-130,-70],hasover:1,forcetodown:1,showdt:200,hidedt:200,asrtl:!0})},loadDeletedPhotosInfo:function(e){var t=[],o=[],s=[],a=[];isArray(e)?each(e,function(e,t){each(geByClass("_deleted_photos",t),function(e,t){a.push(t)})}):a=geByClass("_deleted_photos",e),each(a,function(e,a){hasClass(a,"_loading")||(addClass(a,"_loading"),t.push(attr(a,"mid")),o.push(attr(a,"rid")),s.push(a))}),t.length&&ajax.post("restore2?act=a_load_deleted_photos_info",{mids:t,rids:o},{onDone:function(e){each(s,function(t,o){var s=e[attr(o,"rid")];removeClass(o,"_deleted_photos"),val(o,s),s||addClass(o,"restore_row_deleted_photos_no_bg")})}})},updateDayNumCounter:function(e,t){var o=ge("restore2_day_num");o&&(val(o,e.counter),handlePageCount("rstats",e.counter),window.Notifier&&t&&Notifier.lcSend("restore2UpdateDayNum",e))},showActivity:function(e){var t=intval(domData(e,"count")),o=JSON.parse(domData(e,"activity"));if(t>0){var s="";each(o,function(e,t){s+=getTemplate("restore2activityRow",t)}),showTooltip(e,{dir:"top",className:"restore2_activity_tooltip",text:s,center:1,slideY:5,showdt:100,slide:5,toup:1})}var a=domData(e,"ts"),r=geByClass("_restore2_activity_fragment","restore2_activity_table");e.initedMouseOut||(e.initedMouseOut=!0,addEvent(e,"mouseout",function(){var t=domData(e,"ts");each(r,function(e,o){var s=domData(o,"ts");s==t&&removeClass(o,"restore2_activity_fragment_hover")})})),each(r,function(e,t){var o=domData(t,"ts");o==a&&addClass(t,"restore2_activity_fragment_hover")})}};try{stManager.done("internal/restore2.js")}catch(e){}