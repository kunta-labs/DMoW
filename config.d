{
	"Genesis": {
		"index": 0,
		"application_name": "DMoW",
		"timestamp": 3948494,
		"previous": "00000000000000000000",
		"transactions": []
	},
	"Sandbox": {
				"a": 0,
				"b": 100
	},
	"OnNewMessage": "console.log('chain func on new msg')",
	"OnNewBlock": "console.log('chain fun on new block')",
	"OnCreate": "sb.a = sb.b + 1; sb.new_account = 'user_1'",
	"tx1": "sb.new_funds = sb.a; sb.a = (sb.a - sb.a) + 5; sb['tx1'] = T.new_var"
}