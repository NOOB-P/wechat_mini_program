export const mockSchoolTree = [
    {
        id: 's1',
        name: '第一中学',
        type: 'school',
        children: [
            {
                id: 'g1',
                name: '高一年级',
                type: 'grade',
                children: [
                    { id: 'c1', name: '1班', type: 'class' },
                    { id: 'c2', name: '2班', type: 'class' }
                ]
            },
            {
                id: 'g2',
                name: '高二年级',
                type: 'grade',
                children: [
                    { id: 'c3', name: '1班', type: 'class' },
                    { id: 'c4', name: '2班', type: 'class' }
                ]
            }
        ]
    },
    {
        id: 's2',
        name: '第二中学',
        type: 'school',
        children: [
            {
                id: 'g3',
                name: '初一年级',
                type: 'grade',
                children: [
                    { id: 'c5', name: '3班', type: 'class' },
                    { id: 'c6', name: '4班', type: 'class' }
                ]
            }
        ]
    },
    {
        id: 's3',
        name: '第三实验学校',
        type: 'school',
        children: [
            {
                id: 'g4',
                name: '小学一年级',
                type: 'grade',
                children: [
                    { id: 'c7', name: '实验1班', type: 'class' }
                ]
            }
        ]
    }
];
//# sourceMappingURL=school.js.map