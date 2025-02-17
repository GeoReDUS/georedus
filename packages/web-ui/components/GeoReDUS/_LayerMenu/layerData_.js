export const CATEGORIES = [
  {
    id: 'educacao',
    label: 'Educação',
  },
  {
    id: 'caracteristicas_pop',
    label: 'Características da População',
  },
]

export const LAYERS = [
  {
    path: 'educacao/caracteristicas_pop/alfabetizacao',
    label: 'Alfabetização',
    mapLayerId: 'c78b8155-7cf7-4d7c-b2e1-1badf98a4e96',
    defaultProperty: 'pop_alf_mor_tot_10_14',
    propertyOptions: [
      {
        label: 'Recortes sociais',
        options: [
          {
            label: 'Sexo',
            options: [
              {
                label: 'Mulheres',
                value: 'pop_alf_mor_tot_10_14_fem',
              },
              {
                label: 'Homens',
                value: 'pop_alf_mor_tot_10_14_mas',
              },
            ],
          },
          {
            label: 'Cor',
            options: [
              {
                label: 'Amarela',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Negra',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Indígena',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Branca',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
            ],
          },
          {
            label: 'Sexo + Cor',
            options: [
              {
                label: 'Amarela',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Negra',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Indígena',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
              {
                label: 'Branca',
                value: 'pop_alf_mor_cor_sex_10_14_fem_ind',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'educacao/caracteristicas_pop/alfabetizacao',
    mapLayerId: 'c78b8155-7cf7-4d7c-b2e1-1badf98a4e96',
  },
]
