package v1

const (
	SUCCESS     = 200
	ERROR       = 500
	BAD_REQUEST = 400
)

var MsgFlags = map[int]string{
	SUCCESS:     "ok",
	ERROR:       "fail",
	BAD_REQUEST: "invalid parameters provided",
}

func GetErrorMsg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}

	return MsgFlags[ERROR]
}
