import { useState } from 'react'
import Tabs from '~/components/tabs'
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react'

const MOCK_DATA = [
  {
    id: 'class-1',
    name: 'Lớp Bem 1',
    units: [
      { id: 'u1', name: 'Unit 1: Family Life' },
      { id: 'u2', name: 'Unit 2: Your Body And You' },
      { id: 'u3', name: 'Unit 3: Music' },
    ],
  },
  {
    id: 'class-2',
    name: 'Lớp anh Chun 2',
    units: [
      { id: 'u4', name: 'Unit 1: Family Life' },
      { id: 'u5', name: 'Unit 2: Your Body And You' },
    ],
  },
  {
    id: 'class-3',
    name: 'Lớp 11B1',
    units: [{ id: 'u6', name: 'Unit 1: The Generation Gap' }],
  },
]

const MenuTabs = () => {
  const [activeSidebar, setActiveSidebar] = useState('class')

  const [expandedClasses, setExpandedClasses] = useState({})

  const toggleClass = (classId) => {
    setExpandedClasses((prev) => ({
      [classId]: !prev[classId],
    }))
  }

  return (
    <div>
      <Tabs
        tabs={[
          {
            label: '👩‍🎓 Lớp học',
            value: 'class',
          },
          {
            label: '👩‍🏫 Giáo viên',
            value: 'teacher',
          },
        ]}
        classNames={{ root: 'mb-3' }}
        active={activeSidebar}
        onChange={setActiveSidebar}
      />

      <>
        {activeSidebar === 'class' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {MOCK_DATA.map((cls) => (
              <div key={cls.id} className="mb-2">
                {/* Cấp Cha (Lớp học) */}
                <div
                  onClick={() => toggleClass(cls.id)}
                  className={[
                    'flex items-center justify-between py-2 px-2 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100 ',
                    expandedClasses[cls.id] && 'bg-white',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="font-medium text-gray-800 text-sm truncate max-w-30">
                    🗂️ {cls.name}
                  </span>
                  {expandedClasses[cls.id] ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </div>

                {/* Cấp Con (Units) - Chỉ hiển thị khi được mở rộng */}
                {expandedClasses[cls.id] && (
                  <div className="mt-2 ml-5 flex flex-col gap-1 border-l-2 border-[#E5D9F2] pl-3 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {cls.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center gap-2 p-2.5 text-sm text-gray-600 hover:text-[#6A5EEB] cursor-pointer hover:bg-white rounded-xl transition-colors"
                      >
                        <BookOpen size={16} className="opacity-70 shrink-0" />
                        <span className="font-medium truncate">{unit.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </>
      <>{activeSidebar === 'teacher' && <div>Giáo viên</div>}</>
    </div>
  )
}

export default MenuTabs
