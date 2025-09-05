import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

interface FollowUpRecord {
    id: string;
    customer: string;
    contactPerson: string;
    followUpMethod: string;
    followUpTime: string;
    relatedModule?: string;
    relatedNumber?: string;
    followUpContent: string;
    nextFollowUpTime?: string;
    owner: string;
    department: string;
    locationPhoto?: string;
}

const CustomerFollowUp = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sortField, setSortField] = useState<keyof FollowUpRecord | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        const mockData: FollowUpRecord[] = [{
            id: "1",
            customer: "DS的客户5",
            contactPerson: "手动阀手动阀2",
            followUpMethod: "电话营销",
            followUpTime: "2025-08-22 15:35",
            followUpContent: "11111111111111",
            owner: "卢晓程",
            department: "H亚洲区"
        }, {
            id: "2",
            customer: "林鑫测试客户",
            contactPerson: "林鑫测试客户",
            followUpMethod: "WhatsApp沟通",
            followUpTime: "2025-07-31 15:10",
            followUpContent: "good 10%",
            owner: "林鑫",
            department: "H南美州区"
        }, {
            id: "3",
            customer: "测试客户A",
            contactPerson: "联系人A",
            followUpMethod: "邮件沟通",
            followUpTime: "2025-09-01 10:20",
            followUpContent: "讨论产品需求和报价",
            nextFollowUpTime: "2025-09-08 14:00",
            owner: "张三",
            department: "E欧洲区"
        }, {
            id: "4",
            customer: "测试客户B",
            contactPerson: "联系人B",
            followUpMethod: "视频会议",
            followUpTime: "2025-08-30 09:15",
            followUpContent: "产品演示和功能讲解",
            owner: "李四",
            department: "A美洲区"
        }, {
            id: "5",
            customer: "测试客户C",
            contactPerson: "联系人C",
            followUpMethod: "上门拜访",
            followUpTime: "2025-08-28 16:40",
            followUpContent: "签订合同和交付计划确认",
            nextFollowUpTime: "2025-09-15 10:00",
            owner: "王五",
            department: "H亚洲区"
        }];

        setFollowUpRecords(mockData);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleRecordSelect = (id: string) => {
        setSelectedRecords(
            prev => prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRecords(filteredRecords.map(record => record.id));
        } else {
            setSelectedRecords([]);
        }
    };

    const handleSort = (field: keyof FollowUpRecord) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const handleBatchAction = (action: string) => {
        if (selectedRecords.length === 0) {
            toast.warning("请先选择要操作的记录");
            return;
        }

        switch (action) {
        case "follow":
            toast.success(`已关注 ${selectedRecords.length} 条记录`);
            break;
        case "unfollow":
            toast.success(`已取消关注 ${selectedRecords.length} 条记录`);
            break;
        case "batchEdit":
            toast.info(`批量修改 ${selectedRecords.length} 条记录`);
            break;
        case "recycle":
            toast.success(`已将 ${selectedRecords.length} 条记录移至回收站`);
            break;
        case "export":
            toast.success(`已导出 ${selectedRecords.length} 条记录`);
            break;
        default:
            toast.info(`执行 ${action} 操作`);
        }

        setSelectedRecords([]);
    };

    const filteredRecords = followUpRecords.filter(
        record => record.customer.toLowerCase().includes(searchTerm.toLowerCase()) || record.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) || record.followUpContent.toLowerCase().includes(searchTerm.toLowerCase()) || record.owner.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (!sortField)
            return 0;

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue)
            return 0;

        if (sortField === "followUpTime" || sortField === "nextFollowUpTime") {
            if (!aValue)
                return 1;

            if (!bValue)
                return -1;

            return new Date(aValue).getTime() - new Date(bValue).getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue);
        }

        return 0;
    }).sort((a, b) => {
        if (!sortField || sortDirection === "asc")
            return 0;

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue)
            return 0;

        if (sortField === "followUpTime" || sortField === "nextFollowUpTime") {
            if (!aValue)
                return -1;

            if (!bValue)
                return 1;

            return new Date(bValue).getTime() - new Date(aValue).getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            return bValue.localeCompare(aValue);
        }

        return 0;
    });

    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return <></>;
};

export default CustomerFollowUp;