package v1

const (
	SUCCESS     = 200
	ERROR       = 500
	BAD_REQUEST = 400
	NOT_FOUND   = 404
)

var MsgFlags = map[int]string{
	SUCCESS:     "ok",
	ERROR:       "fail",
	BAD_REQUEST: "invalid parameters provided",
	NOT_FOUND:   "resource could not be found",
}

func GetErrorMsg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}

	return MsgFlags[ERROR]
}
