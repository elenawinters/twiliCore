fx_version 'cerulean'
games { 'gta5', 'rdr3' }

author 'Elena Winters'
description 'Core functions used by my scripts to make my life easier.'
version 'dev_0.1.0+23.10.20'

rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

-- ui_page 'html/ui.html'

-- files {
--     'html/ui.html',
--     'html/script.js',
--     'html/style.css',
-- }

shared_scripts {
    'shared/u_common.js'
}

client_scripts {
    'client/c_globals.js',
    'client/c_damage.js',
    'client/c_tests.js'
}

server_scripts {
    'server/s_damage.js'
    -- 'server/s_tests.js'
}

