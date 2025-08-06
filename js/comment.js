window.addEventListener('DOMContentLoaded', () =>
    {
        jQuery("#go_to_comment").click(function () {
            jQuery("html, body").animate({ scrollTop: jQuery("#comment_form").offset().top }, 1000);
        });
        jQuery("#btn_comments_area").click(function () {
            jQuery("html, body").animate({ scrollTop: jQuery("#comment_form").offset().top }, 1000);
        });

        jQuery('#sort_by').on('change', function () {
            load_comment(1,5,"" + this.value + "","#list_comment","f5");
        });

        jQuery('#load_more_comment').click(function (event) {
            event.preventDefault();
            let sort = jQuery(this).data("sort");
            let page = jQuery(this).data("page");
            let limit = jQuery(this).data("limit");
            load_comment(page, limit, sort,'#list_comment','');
        });

        jQuery("#comment_form").validate({
            onfocusout: false,
            focusInvalid: false,
            errorElement: "div",
            errorPlacement: function (error, element) {
                error.appendTo("div#comment_errors");
            },
            ignore: ".ignore",
            rules: {
                "comment_content": {
                    required: true,
                    maxlength: 100
                },
                "comment_author": {
                    required: true,
                    maxlength: 50
                },
                "comment_email": {
                    required: true,
                    email: true,
                    maxlength: 100
                },
                "commentChecked": {
                    required: true
                }
            },
            messages: {
                "comment_content": {
                    required: "Please type your comment!",
                    maxlength: ""
                },
                "comment_author": {
                    required: "Please type your name!",
                    maxlength: ""
                },
                "comment_email": {
                    required: "Please type your email",
                    email: "Check your email is not exactly!",
                    maxlength: ""
                },
                "commentChecked": {
                    required: "Please agree to the terms and conditions before comment."
                }
            },
            submitHandler: function () {
                let metadataLoad = {};
                jQuery(".comment_loading").show();
                metadataLoad.site = _site;
                metadataLoad.game = _game;
                metadataLoad.parentId = jQuery("#parent_id").val();
                metadataLoad.email = jQuery("#comment_email").val();
                metadataLoad.author = jQuery("#comment_author").val();
                metadataLoad.content = jQuery("#comment_content").val();
                metadataLoad.website = jQuery("#comment_website").val();
                jQuery.ajax({
                    type: "POST",
                    cache: false,
                    url: _url + "api/makeComment",
                    data: JSON.stringify(metadataLoad),
                    contentType: "application/json; charset=utf-8",
                    success: function (commentData) {
                        jQuery(".comment_loading").hide();
                        if (commentData != '') {
                            let str_comment = "";
                            if (commentData.parentId == 0) {
                                str_comment = genCommentHtml(commentData);
                                if (commentData.status == 'trash') {
                                    str_comment += "<p><i>Your comment is awaiting moderation!</i></p>";
                                }
                                jQuery("#list_comment").prepend(str_comment);
                            } else {
                                str_comment = `<div id="comment_${commentData.id}" class="replyWrap your_comment clearAfter"><div class="listProfile"><div class="img img-thumbnail">${commentData.author.charAt(0)}</div><span class="user">${commentData.author}</span><span class="user">${commentData.date}</span></div><div class="listContent"><div class="comment--content">${commentData.content}</div></div></div>`;
                                if (commentData.status == 'trash') {
                                    str_comment += "<p><i>Your comment is awaiting moderation!</i></p>";
                                }
                                jQuery("#comment_" + commentData.parent_id).append(str_comment);
                                jQuery("#comment_form").appendTo(".make-comment");
                                jQuery("#comment_form").removeClass("commentBlock");
                                reply_all();
                            }

                            jQuery("#comment_count").html('('+parseInt((commentData.count))+')');
                            jQuery("html, body").animate({
                                scrollTop: jQuery("#list_comment").offset().top
                            }, 1000);
                            jQuery("#comment_form").trigger("reset");
                        }
                    }
                });
            }
        });
        load_comment(1, 5, 'newest','#list_comment', 'f5');
    }
)

function reply_to(comment_id) {
    jQuery("#comment_form").addClass("commentBlock");
    jQuery("#btn_cancel").removeClass("hidden");
    jQuery("#comment_form").trigger("reset");
    jQuery("#parent_id").val(comment_id);
    jQuery("#comment_form").appendTo("#comment_" + comment_id);
}

function reply_all() {
    jQuery("#comment_form").trigger("reset");
    jQuery("#parent_id").val("0");
    jQuery("#comment_form").appendTo(".make-comment");
    jQuery("#btn_cancel").addClass("hidden");
    jQuery("#comment_form").removeClass("commentBlock");
}

function comment_vote(comment_id, vote) {
    jQuery(".comment_vote_row_" + comment_id).css("fontSize", 0);
    jQuery(".comment_vote_row_" + comment_id).prop('onclick', null).off('click');

    let metadataLoad = {};
    metadataLoad.vote = vote;
    metadataLoad.commentId = comment_id;
    jQuery.ajax({
        type: "POST",
        cache: false,
        url: _url + "api/commentVote",
        data: JSON.stringify(metadataLoad),
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            if (result != '') {
                switch (vote) {
                    case "up":
                        jQuery("#comment_voteup_" + comment_id).html(result.like);
                        break;
                    case "down":
                        jQuery("#comment_votedown_" + comment_id).html(result.disLike);
                        break;
                }
            }
        }
    });
}

function report_comment(comment_id) {
    jQuery("#report_comment_" + comment_id).css("fontSize", 0);
    jQuery("#report_comment_" + comment_id).prop('onclick', null).off('click');
}

function load_comment(page, limit, sort, main_contain_id, refresh) {
    jQuery("#load_more_comment").remove();
    jQuery(".comment-load-more").show();

    let metadataLoad = {};
    metadataLoad.site = _site;
    metadataLoad.game = _game;
    metadataLoad.sort = sort;
    metadataLoad.page = page;
    metadataLoad.limit = limit;
    jQuery.ajax({
        type: "POST",
        cache: false,
        url: _url + "api/commentPaging",
        data: JSON.stringify(metadataLoad),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            jQuery(".comment-load-more").hide();
            let _html = '';
            for (let idx in data.commentList) {
                _html += genCommentHtml(data.commentList[idx]);
            }
            if (refresh === 'f5') {
                jQuery(main_contain_id).html(_html);
            } else {
                jQuery(main_contain_id).append(_html);
            }
            jQuery('#load_more_comment').click(function(event) {
                event.preventDefault();
                let sort = jQuery(this).data("sort");
                let page = jQuery(this).data("page");
                let limit = jQuery(this).data("limit");
                load_comment(page, limit, sort, '#list_comment', '');
            });
            jQuery("#comment_count").html('('+parseInt(data.commentCount==null?0:data.commentCount)+')');
        }
    });
}

function commentUpdateStatus(event, id) {
    if (!id) { return; }

    let status = $(event).val();
    let url = _url + 'api/commentUpdate';
    jQuery.ajax({
        url: url,
        type: "POST",
        data: {
            id: id,
            status: status
        },
        success: function(response) {
            if (response == 1) {
                alert("Update successfully!");
            } else {
                alert("Update failed! Please contact Administrators");
            }
        }
    })
}

function genCommentHtml(commentData) {
    return `<div id="comment_${commentData.id}" class="replyWrap clearAfter">
        <div class="listProfile">
            <div class="img img-thumbnail">${commentData.author.charAt(0)}</div>
            <span class="user">${commentData.author}</span>
            <span class="user">${commentData.date}</span>
        </div>
        <div class="listContent">
            <div class="comment--content">${commentData.content}</div>
            <div class="control-action">
                <a class="icon vote comment_vote_row_${commentData.id} voteUp" href="javascript:;" onclick="comment_vote(${commentData.id},'up');return false;" title="Vote this comment up (helpful)" rel="nofollow">
                    <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="style=fill">
                            <g id="like">
                                <path id="Subtract" fill-rule="evenodd" clip-rule="evenodd" d="M15.9977 5.63891C16.2695 4.34931 15.433 3.00969 14.2102 2.59462C13.6171 2.37633 12.9892 2.4252 12.4662 2.60499C11.9449 2.78419 11.4461 3.12142 11.1369 3.58441L11.136 3.58573L7.49506 9.00272C8.05104 9.29585 8.43005 9.87954 8.43005 10.5518V21.3018H6.91003V21.3018H16.6801C18.2938 21.3018 19.2028 20.2977 19.8943 19.202C20.6524 18.0009 21.1453 16.7211 21.5116 15.5812C21.6808 15.0546 21.8252 14.5503 21.9547 14.0984L21.9863 13.9881C22.126 13.5007 22.2457 13.0904 22.366 12.7549C22.698 11.8292 22.5933 10.9072 22.067 10.2072C21.5476 9.5166 20.7005 9.15175 19.76 9.15175H15.76C15.6702 9.15175 15.6017 9.11544 15.5599 9.06803C15.5238 9.02716 15.4831 8.95058 15.502 8.81171L15.9977 5.63891Z" fill="" />
                                <path id="rec" d="M2.18005 10.6199C2.18005 10.03 2.62777 9.55176 3.18005 9.55176H6.68005C7.23234 9.55176 7.68005 10.03 7.68005 10.6199V21.3018H3.18005C2.62777 21.3018 2.18005 20.8235 2.18005 20.2336V10.6199Z" fill="" />
                            </g>
                        </g>
                    </svg>
                    <b class="voteUp" id="comment_voteup_${commentData.id}">${commentData.like}</b>
                </a>
                <a class="icon vote comment_vote_row_${commentData.id} voteDown" href="javascript:;" onclick="comment_vote(${commentData.id},'down');return false;" title="Vote this comment down (not helpful)" rel="nofollow">
                    <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="style=fill">
                            <g id="like">
                                <path id="Subtract" fill-rule="evenodd" clip-rule="evenodd" d="M15.9977 5.63891C16.2695 4.34931 15.433 3.00969 14.2102 2.59462C13.6171 2.37633 12.9892 2.4252 12.4662 2.60499C11.9449 2.78419 11.4461 3.12142 11.1369 3.58441L11.136 3.58573L7.49506 9.00272C8.05104 9.29585 8.43005 9.87954 8.43005 10.5518V21.3018H6.91003V21.3018H16.6801C18.2938 21.3018 19.2028 20.2977 19.8943 19.202C20.6524 18.0009 21.1453 16.7211 21.5116 15.5812C21.6808 15.0546 21.8252 14.5503 21.9547 14.0984L21.9863 13.9881C22.126 13.5007 22.2457 13.0904 22.366 12.7549C22.698 11.8292 22.5933 10.9072 22.067 10.2072C21.5476 9.5166 20.7005 9.15175 19.76 9.15175H15.76C15.6702 9.15175 15.6017 9.11544 15.5599 9.06803C15.5238 9.02716 15.4831 8.95058 15.502 8.81171L15.9977 5.63891Z" fill="" />
                                <path id="rec" d="M2.18005 10.6199C2.18005 10.03 2.62777 9.55176 3.18005 9.55176H6.68005C7.23234 9.55176 7.68005 10.03 7.68005 10.6199V21.3018H3.18005C2.62777 21.3018 2.18005 20.8235 2.18005 20.2336V10.6199Z" fill="" />
                            </g>
                        </g>
                    </svg>
                    <b class="voteDown" id="comment_votedown_${commentData.id}">${commentData.disLike}</b>
                </a>
            </div>
        </div>
    </div>`;
}