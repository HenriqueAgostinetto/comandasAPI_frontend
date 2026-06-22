export const USER_GROUPS = {
    ADMINISTRADOR: 1,
    ATENDENTE: 2,
    CAIXA: 3
};
export const GROUP_CONFIG = {
    [USER_GROUPS.ADMINISTRADOR]: {
        label: 'Administrador',
        color: 'error'
},
[USER_GROUPS.ATENDENTE]: {
    label: 'Atendente',
    color: 'primary'
},
[USER_GROUPS.CAIXA]: {
    label: 'Caixa',
    color: 'success'
}
};
    export const getGrupoInfo = (grupo) => {
    return GROUP_CONFIG[grupo] || { label: 'Não definido', color: 'default' };
};
export const GROUP_OPTIONS = [
    { value: USER_GROUPS.ADMINISTRADOR, label: 'Administrador' },
    { value: USER_GROUPS.ATENDENTE, label: 'Atendente' },
    { value: USER_GROUPS.CAIXA, label: 'Caixa' }
];
