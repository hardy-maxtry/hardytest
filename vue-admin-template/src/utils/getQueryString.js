function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var lastIndexOfQuestionMark =  window.location.href.lastIndexOf('?');
    var r = window.location.href.substr(lastIndexOfQuestionMark +1 ).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

export default getQueryString