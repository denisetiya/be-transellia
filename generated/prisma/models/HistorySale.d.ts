import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model HistorySale
 *
 */
export type HistorySaleModel = runtime.Types.Result.DefaultSelection<Prisma.$HistorySalePayload>;
export type AggregateHistorySale = {
    _count: HistorySaleCountAggregateOutputType | null;
    _avg: HistorySaleAvgAggregateOutputType | null;
    _sum: HistorySaleSumAggregateOutputType | null;
    _min: HistorySaleMinAggregateOutputType | null;
    _max: HistorySaleMaxAggregateOutputType | null;
};
export type HistorySaleAvgAggregateOutputType = {
    totalProduct: number | null;
    totalPrice: number | null;
};
export type HistorySaleSumAggregateOutputType = {
    totalProduct: number | null;
    totalPrice: number | null;
};
export type HistorySaleMinAggregateOutputType = {
    id: string | null;
    productId: string | null;
    EmployeeId: string | null;
    totalProduct: number | null;
    paymentMethod: string | null;
    totalPrice: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type HistorySaleMaxAggregateOutputType = {
    id: string | null;
    productId: string | null;
    EmployeeId: string | null;
    totalProduct: number | null;
    paymentMethod: string | null;
    totalPrice: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type HistorySaleCountAggregateOutputType = {
    id: number;
    productId: number;
    EmployeeId: number;
    totalProduct: number;
    paymentMethod: number;
    totalPrice: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type HistorySaleAvgAggregateInputType = {
    totalProduct?: true;
    totalPrice?: true;
};
export type HistorySaleSumAggregateInputType = {
    totalProduct?: true;
    totalPrice?: true;
};
export type HistorySaleMinAggregateInputType = {
    id?: true;
    productId?: true;
    EmployeeId?: true;
    totalProduct?: true;
    paymentMethod?: true;
    totalPrice?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type HistorySaleMaxAggregateInputType = {
    id?: true;
    productId?: true;
    EmployeeId?: true;
    totalProduct?: true;
    paymentMethod?: true;
    totalPrice?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type HistorySaleCountAggregateInputType = {
    id?: true;
    productId?: true;
    EmployeeId?: true;
    totalProduct?: true;
    paymentMethod?: true;
    totalPrice?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type HistorySaleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which HistorySale to aggregate.
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of HistorySales to fetch.
     */
    orderBy?: Prisma.HistorySaleOrderByWithRelationInput | Prisma.HistorySaleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.HistorySaleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` HistorySales from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` HistorySales.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned HistorySales
    **/
    _count?: true | HistorySaleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: HistorySaleAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: HistorySaleSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: HistorySaleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: HistorySaleMaxAggregateInputType;
};
export type GetHistorySaleAggregateType<T extends HistorySaleAggregateArgs> = {
    [P in keyof T & keyof AggregateHistorySale]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHistorySale[P]> : Prisma.GetScalarType<T[P], AggregateHistorySale[P]>;
};
export type HistorySaleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HistorySaleWhereInput;
    orderBy?: Prisma.HistorySaleOrderByWithAggregationInput | Prisma.HistorySaleOrderByWithAggregationInput[];
    by: Prisma.HistorySaleScalarFieldEnum[] | Prisma.HistorySaleScalarFieldEnum;
    having?: Prisma.HistorySaleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HistorySaleCountAggregateInputType | true;
    _avg?: HistorySaleAvgAggregateInputType;
    _sum?: HistorySaleSumAggregateInputType;
    _min?: HistorySaleMinAggregateInputType;
    _max?: HistorySaleMaxAggregateInputType;
};
export type HistorySaleGroupByOutputType = {
    id: string;
    productId: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod: string | null;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    _count: HistorySaleCountAggregateOutputType | null;
    _avg: HistorySaleAvgAggregateOutputType | null;
    _sum: HistorySaleSumAggregateOutputType | null;
    _min: HistorySaleMinAggregateOutputType | null;
    _max: HistorySaleMaxAggregateOutputType | null;
};
type GetHistorySaleGroupByPayload<T extends HistorySaleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HistorySaleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HistorySaleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HistorySaleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HistorySaleGroupByOutputType[P]>;
}>>;
export type HistorySaleWhereInput = {
    AND?: Prisma.HistorySaleWhereInput | Prisma.HistorySaleWhereInput[];
    OR?: Prisma.HistorySaleWhereInput[];
    NOT?: Prisma.HistorySaleWhereInput | Prisma.HistorySaleWhereInput[];
    id?: Prisma.StringFilter<"HistorySale"> | string;
    productId?: Prisma.StringFilter<"HistorySale"> | string;
    EmployeeId?: Prisma.StringFilter<"HistorySale"> | string;
    totalProduct?: Prisma.FloatFilter<"HistorySale"> | number;
    paymentMethod?: Prisma.StringNullableFilter<"HistorySale"> | string | null;
    totalPrice?: Prisma.FloatFilter<"HistorySale"> | number;
    createdAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
    Product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
};
export type HistorySaleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    EmployeeId?: Prisma.SortOrder;
    totalProduct?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    Product?: Prisma.ProductOrderByWithRelationInput;
};
export type HistorySaleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.HistorySaleWhereInput | Prisma.HistorySaleWhereInput[];
    OR?: Prisma.HistorySaleWhereInput[];
    NOT?: Prisma.HistorySaleWhereInput | Prisma.HistorySaleWhereInput[];
    productId?: Prisma.StringFilter<"HistorySale"> | string;
    EmployeeId?: Prisma.StringFilter<"HistorySale"> | string;
    totalProduct?: Prisma.FloatFilter<"HistorySale"> | number;
    paymentMethod?: Prisma.StringNullableFilter<"HistorySale"> | string | null;
    totalPrice?: Prisma.FloatFilter<"HistorySale"> | number;
    createdAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
    Product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
}, "id">;
export type HistorySaleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    EmployeeId?: Prisma.SortOrder;
    totalProduct?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.HistorySaleCountOrderByAggregateInput;
    _avg?: Prisma.HistorySaleAvgOrderByAggregateInput;
    _max?: Prisma.HistorySaleMaxOrderByAggregateInput;
    _min?: Prisma.HistorySaleMinOrderByAggregateInput;
    _sum?: Prisma.HistorySaleSumOrderByAggregateInput;
};
export type HistorySaleScalarWhereWithAggregatesInput = {
    AND?: Prisma.HistorySaleScalarWhereWithAggregatesInput | Prisma.HistorySaleScalarWhereWithAggregatesInput[];
    OR?: Prisma.HistorySaleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HistorySaleScalarWhereWithAggregatesInput | Prisma.HistorySaleScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"HistorySale"> | string;
    productId?: Prisma.StringWithAggregatesFilter<"HistorySale"> | string;
    EmployeeId?: Prisma.StringWithAggregatesFilter<"HistorySale"> | string;
    totalProduct?: Prisma.FloatWithAggregatesFilter<"HistorySale"> | number;
    paymentMethod?: Prisma.StringNullableWithAggregatesFilter<"HistorySale"> | string | null;
    totalPrice?: Prisma.FloatWithAggregatesFilter<"HistorySale"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"HistorySale"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"HistorySale"> | Date | string;
};
export type HistorySaleCreateInput = {
    id?: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    Product: Prisma.ProductCreateNestedOneWithoutHistorySalesInput;
};
export type HistorySaleUncheckedCreateInput = {
    id?: string;
    productId: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type HistorySaleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    Product?: Prisma.ProductUpdateOneRequiredWithoutHistorySalesNestedInput;
};
export type HistorySaleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleCreateManyInput = {
    id?: string;
    productId: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type HistorySaleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleListRelationFilter = {
    every?: Prisma.HistorySaleWhereInput;
    some?: Prisma.HistorySaleWhereInput;
    none?: Prisma.HistorySaleWhereInput;
};
export type HistorySaleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HistorySaleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    EmployeeId?: Prisma.SortOrder;
    totalProduct?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type HistorySaleAvgOrderByAggregateInput = {
    totalProduct?: Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
};
export type HistorySaleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    EmployeeId?: Prisma.SortOrder;
    totalProduct?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type HistorySaleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    EmployeeId?: Prisma.SortOrder;
    totalProduct?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type HistorySaleSumOrderByAggregateInput = {
    totalProduct?: Prisma.SortOrder;
    totalPrice?: Prisma.SortOrder;
};
export type HistorySaleCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput> | Prisma.HistorySaleCreateWithoutProductInput[] | Prisma.HistorySaleUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.HistorySaleCreateOrConnectWithoutProductInput | Prisma.HistorySaleCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.HistorySaleCreateManyProductInputEnvelope;
    connect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
};
export type HistorySaleUncheckedCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput> | Prisma.HistorySaleCreateWithoutProductInput[] | Prisma.HistorySaleUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.HistorySaleCreateOrConnectWithoutProductInput | Prisma.HistorySaleCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.HistorySaleCreateManyProductInputEnvelope;
    connect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
};
export type HistorySaleUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput> | Prisma.HistorySaleCreateWithoutProductInput[] | Prisma.HistorySaleUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.HistorySaleCreateOrConnectWithoutProductInput | Prisma.HistorySaleCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.HistorySaleUpsertWithWhereUniqueWithoutProductInput | Prisma.HistorySaleUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.HistorySaleCreateManyProductInputEnvelope;
    set?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    disconnect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    delete?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    connect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    update?: Prisma.HistorySaleUpdateWithWhereUniqueWithoutProductInput | Prisma.HistorySaleUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.HistorySaleUpdateManyWithWhereWithoutProductInput | Prisma.HistorySaleUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.HistorySaleScalarWhereInput | Prisma.HistorySaleScalarWhereInput[];
};
export type HistorySaleUncheckedUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput> | Prisma.HistorySaleCreateWithoutProductInput[] | Prisma.HistorySaleUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.HistorySaleCreateOrConnectWithoutProductInput | Prisma.HistorySaleCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.HistorySaleUpsertWithWhereUniqueWithoutProductInput | Prisma.HistorySaleUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.HistorySaleCreateManyProductInputEnvelope;
    set?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    disconnect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    delete?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    connect?: Prisma.HistorySaleWhereUniqueInput | Prisma.HistorySaleWhereUniqueInput[];
    update?: Prisma.HistorySaleUpdateWithWhereUniqueWithoutProductInput | Prisma.HistorySaleUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.HistorySaleUpdateManyWithWhereWithoutProductInput | Prisma.HistorySaleUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.HistorySaleScalarWhereInput | Prisma.HistorySaleScalarWhereInput[];
};
export type HistorySaleCreateWithoutProductInput = {
    id?: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type HistorySaleUncheckedCreateWithoutProductInput = {
    id?: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type HistorySaleCreateOrConnectWithoutProductInput = {
    where: Prisma.HistorySaleWhereUniqueInput;
    create: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput>;
};
export type HistorySaleCreateManyProductInputEnvelope = {
    data: Prisma.HistorySaleCreateManyProductInput | Prisma.HistorySaleCreateManyProductInput[];
    skipDuplicates?: boolean;
};
export type HistorySaleUpsertWithWhereUniqueWithoutProductInput = {
    where: Prisma.HistorySaleWhereUniqueInput;
    update: Prisma.XOR<Prisma.HistorySaleUpdateWithoutProductInput, Prisma.HistorySaleUncheckedUpdateWithoutProductInput>;
    create: Prisma.XOR<Prisma.HistorySaleCreateWithoutProductInput, Prisma.HistorySaleUncheckedCreateWithoutProductInput>;
};
export type HistorySaleUpdateWithWhereUniqueWithoutProductInput = {
    where: Prisma.HistorySaleWhereUniqueInput;
    data: Prisma.XOR<Prisma.HistorySaleUpdateWithoutProductInput, Prisma.HistorySaleUncheckedUpdateWithoutProductInput>;
};
export type HistorySaleUpdateManyWithWhereWithoutProductInput = {
    where: Prisma.HistorySaleScalarWhereInput;
    data: Prisma.XOR<Prisma.HistorySaleUpdateManyMutationInput, Prisma.HistorySaleUncheckedUpdateManyWithoutProductInput>;
};
export type HistorySaleScalarWhereInput = {
    AND?: Prisma.HistorySaleScalarWhereInput | Prisma.HistorySaleScalarWhereInput[];
    OR?: Prisma.HistorySaleScalarWhereInput[];
    NOT?: Prisma.HistorySaleScalarWhereInput | Prisma.HistorySaleScalarWhereInput[];
    id?: Prisma.StringFilter<"HistorySale"> | string;
    productId?: Prisma.StringFilter<"HistorySale"> | string;
    EmployeeId?: Prisma.StringFilter<"HistorySale"> | string;
    totalProduct?: Prisma.FloatFilter<"HistorySale"> | number;
    paymentMethod?: Prisma.StringNullableFilter<"HistorySale"> | string | null;
    totalPrice?: Prisma.FloatFilter<"HistorySale"> | number;
    createdAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"HistorySale"> | Date | string;
};
export type HistorySaleCreateManyProductInput = {
    id?: string;
    EmployeeId: string;
    totalProduct: number;
    paymentMethod?: string | null;
    totalPrice: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type HistorySaleUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleUncheckedUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleUncheckedUpdateManyWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    EmployeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalProduct?: Prisma.FloatFieldUpdateOperationsInput | number;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type HistorySaleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    productId?: boolean;
    EmployeeId?: boolean;
    totalProduct?: boolean;
    paymentMethod?: boolean;
    totalPrice?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["historySale"]>;
export type HistorySaleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    productId?: boolean;
    EmployeeId?: boolean;
    totalProduct?: boolean;
    paymentMethod?: boolean;
    totalPrice?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["historySale"]>;
export type HistorySaleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    productId?: boolean;
    EmployeeId?: boolean;
    totalProduct?: boolean;
    paymentMethod?: boolean;
    totalPrice?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["historySale"]>;
export type HistorySaleSelectScalar = {
    id?: boolean;
    productId?: boolean;
    EmployeeId?: boolean;
    totalProduct?: boolean;
    paymentMethod?: boolean;
    totalPrice?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type HistorySaleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "productId" | "EmployeeId" | "totalProduct" | "paymentMethod" | "totalPrice" | "createdAt" | "updatedAt", ExtArgs["result"]["historySale"]>;
export type HistorySaleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type HistorySaleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type HistorySaleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type $HistorySalePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HistorySale";
    objects: {
        Product: Prisma.$ProductPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        productId: string;
        EmployeeId: string;
        totalProduct: number;
        paymentMethod: string | null;
        totalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["historySale"]>;
    composites: {};
};
export type HistorySaleGetPayload<S extends boolean | null | undefined | HistorySaleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HistorySalePayload, S>;
export type HistorySaleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HistorySaleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HistorySaleCountAggregateInputType | true;
};
export interface HistorySaleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HistorySale'];
        meta: {
            name: 'HistorySale';
        };
    };
    /**
     * Find zero or one HistorySale that matches the filter.
     * @param {HistorySaleFindUniqueArgs} args - Arguments to find a HistorySale
     * @example
     * // Get one HistorySale
     * const historySale = await prisma.historySale.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HistorySaleFindUniqueArgs>(args: Prisma.SelectSubset<T, HistorySaleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one HistorySale that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HistorySaleFindUniqueOrThrowArgs} args - Arguments to find a HistorySale
     * @example
     * // Get one HistorySale
     * const historySale = await prisma.historySale.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HistorySaleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HistorySaleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first HistorySale that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleFindFirstArgs} args - Arguments to find a HistorySale
     * @example
     * // Get one HistorySale
     * const historySale = await prisma.historySale.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HistorySaleFindFirstArgs>(args?: Prisma.SelectSubset<T, HistorySaleFindFirstArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first HistorySale that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleFindFirstOrThrowArgs} args - Arguments to find a HistorySale
     * @example
     * // Get one HistorySale
     * const historySale = await prisma.historySale.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HistorySaleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HistorySaleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more HistorySales that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HistorySales
     * const historySales = await prisma.historySale.findMany()
     *
     * // Get first 10 HistorySales
     * const historySales = await prisma.historySale.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const historySaleWithIdOnly = await prisma.historySale.findMany({ select: { id: true } })
     *
     */
    findMany<T extends HistorySaleFindManyArgs>(args?: Prisma.SelectSubset<T, HistorySaleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a HistorySale.
     * @param {HistorySaleCreateArgs} args - Arguments to create a HistorySale.
     * @example
     * // Create one HistorySale
     * const HistorySale = await prisma.historySale.create({
     *   data: {
     *     // ... data to create a HistorySale
     *   }
     * })
     *
     */
    create<T extends HistorySaleCreateArgs>(args: Prisma.SelectSubset<T, HistorySaleCreateArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many HistorySales.
     * @param {HistorySaleCreateManyArgs} args - Arguments to create many HistorySales.
     * @example
     * // Create many HistorySales
     * const historySale = await prisma.historySale.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends HistorySaleCreateManyArgs>(args?: Prisma.SelectSubset<T, HistorySaleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many HistorySales and returns the data saved in the database.
     * @param {HistorySaleCreateManyAndReturnArgs} args - Arguments to create many HistorySales.
     * @example
     * // Create many HistorySales
     * const historySale = await prisma.historySale.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many HistorySales and only return the `id`
     * const historySaleWithIdOnly = await prisma.historySale.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends HistorySaleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, HistorySaleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a HistorySale.
     * @param {HistorySaleDeleteArgs} args - Arguments to delete one HistorySale.
     * @example
     * // Delete one HistorySale
     * const HistorySale = await prisma.historySale.delete({
     *   where: {
     *     // ... filter to delete one HistorySale
     *   }
     * })
     *
     */
    delete<T extends HistorySaleDeleteArgs>(args: Prisma.SelectSubset<T, HistorySaleDeleteArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one HistorySale.
     * @param {HistorySaleUpdateArgs} args - Arguments to update one HistorySale.
     * @example
     * // Update one HistorySale
     * const historySale = await prisma.historySale.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends HistorySaleUpdateArgs>(args: Prisma.SelectSubset<T, HistorySaleUpdateArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more HistorySales.
     * @param {HistorySaleDeleteManyArgs} args - Arguments to filter HistorySales to delete.
     * @example
     * // Delete a few HistorySales
     * const { count } = await prisma.historySale.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends HistorySaleDeleteManyArgs>(args?: Prisma.SelectSubset<T, HistorySaleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more HistorySales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HistorySales
     * const historySale = await prisma.historySale.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends HistorySaleUpdateManyArgs>(args: Prisma.SelectSubset<T, HistorySaleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more HistorySales and returns the data updated in the database.
     * @param {HistorySaleUpdateManyAndReturnArgs} args - Arguments to update many HistorySales.
     * @example
     * // Update many HistorySales
     * const historySale = await prisma.historySale.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more HistorySales and only return the `id`
     * const historySaleWithIdOnly = await prisma.historySale.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends HistorySaleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, HistorySaleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one HistorySale.
     * @param {HistorySaleUpsertArgs} args - Arguments to update or create a HistorySale.
     * @example
     * // Update or create a HistorySale
     * const historySale = await prisma.historySale.upsert({
     *   create: {
     *     // ... data to create a HistorySale
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HistorySale we want to update
     *   }
     * })
     */
    upsert<T extends HistorySaleUpsertArgs>(args: Prisma.SelectSubset<T, HistorySaleUpsertArgs<ExtArgs>>): Prisma.Prisma__HistorySaleClient<runtime.Types.Result.GetResult<Prisma.$HistorySalePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of HistorySales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleCountArgs} args - Arguments to filter HistorySales to count.
     * @example
     * // Count the number of HistorySales
     * const count = await prisma.historySale.count({
     *   where: {
     *     // ... the filter for the HistorySales we want to count
     *   }
     * })
    **/
    count<T extends HistorySaleCountArgs>(args?: Prisma.Subset<T, HistorySaleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HistorySaleCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a HistorySale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HistorySaleAggregateArgs>(args: Prisma.Subset<T, HistorySaleAggregateArgs>): Prisma.PrismaPromise<GetHistorySaleAggregateType<T>>;
    /**
     * Group by HistorySale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorySaleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends HistorySaleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HistorySaleGroupByArgs['orderBy'];
    } : {
        orderBy?: HistorySaleGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HistorySaleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHistorySaleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the HistorySale model
     */
    readonly fields: HistorySaleFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for HistorySale.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__HistorySaleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    Product<T extends Prisma.ProductDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProductDefaultArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the HistorySale model
 */
export interface HistorySaleFieldRefs {
    readonly id: Prisma.FieldRef<"HistorySale", 'String'>;
    readonly productId: Prisma.FieldRef<"HistorySale", 'String'>;
    readonly EmployeeId: Prisma.FieldRef<"HistorySale", 'String'>;
    readonly totalProduct: Prisma.FieldRef<"HistorySale", 'Float'>;
    readonly paymentMethod: Prisma.FieldRef<"HistorySale", 'String'>;
    readonly totalPrice: Prisma.FieldRef<"HistorySale", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"HistorySale", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"HistorySale", 'DateTime'>;
}
/**
 * HistorySale findUnique
 */
export type HistorySaleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter, which HistorySale to fetch.
     */
    where: Prisma.HistorySaleWhereUniqueInput;
};
/**
 * HistorySale findUniqueOrThrow
 */
export type HistorySaleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter, which HistorySale to fetch.
     */
    where: Prisma.HistorySaleWhereUniqueInput;
};
/**
 * HistorySale findFirst
 */
export type HistorySaleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter, which HistorySale to fetch.
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of HistorySales to fetch.
     */
    orderBy?: Prisma.HistorySaleOrderByWithRelationInput | Prisma.HistorySaleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for HistorySales.
     */
    cursor?: Prisma.HistorySaleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` HistorySales from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` HistorySales.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of HistorySales.
     */
    distinct?: Prisma.HistorySaleScalarFieldEnum | Prisma.HistorySaleScalarFieldEnum[];
};
/**
 * HistorySale findFirstOrThrow
 */
export type HistorySaleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter, which HistorySale to fetch.
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of HistorySales to fetch.
     */
    orderBy?: Prisma.HistorySaleOrderByWithRelationInput | Prisma.HistorySaleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for HistorySales.
     */
    cursor?: Prisma.HistorySaleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` HistorySales from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` HistorySales.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of HistorySales.
     */
    distinct?: Prisma.HistorySaleScalarFieldEnum | Prisma.HistorySaleScalarFieldEnum[];
};
/**
 * HistorySale findMany
 */
export type HistorySaleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter, which HistorySales to fetch.
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of HistorySales to fetch.
     */
    orderBy?: Prisma.HistorySaleOrderByWithRelationInput | Prisma.HistorySaleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing HistorySales.
     */
    cursor?: Prisma.HistorySaleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` HistorySales from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` HistorySales.
     */
    skip?: number;
    distinct?: Prisma.HistorySaleScalarFieldEnum | Prisma.HistorySaleScalarFieldEnum[];
};
/**
 * HistorySale create
 */
export type HistorySaleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * The data needed to create a HistorySale.
     */
    data: Prisma.XOR<Prisma.HistorySaleCreateInput, Prisma.HistorySaleUncheckedCreateInput>;
};
/**
 * HistorySale createMany
 */
export type HistorySaleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many HistorySales.
     */
    data: Prisma.HistorySaleCreateManyInput | Prisma.HistorySaleCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * HistorySale createManyAndReturn
 */
export type HistorySaleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * The data used to create many HistorySales.
     */
    data: Prisma.HistorySaleCreateManyInput | Prisma.HistorySaleCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * HistorySale update
 */
export type HistorySaleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * The data needed to update a HistorySale.
     */
    data: Prisma.XOR<Prisma.HistorySaleUpdateInput, Prisma.HistorySaleUncheckedUpdateInput>;
    /**
     * Choose, which HistorySale to update.
     */
    where: Prisma.HistorySaleWhereUniqueInput;
};
/**
 * HistorySale updateMany
 */
export type HistorySaleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update HistorySales.
     */
    data: Prisma.XOR<Prisma.HistorySaleUpdateManyMutationInput, Prisma.HistorySaleUncheckedUpdateManyInput>;
    /**
     * Filter which HistorySales to update
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * Limit how many HistorySales to update.
     */
    limit?: number;
};
/**
 * HistorySale updateManyAndReturn
 */
export type HistorySaleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * The data used to update HistorySales.
     */
    data: Prisma.XOR<Prisma.HistorySaleUpdateManyMutationInput, Prisma.HistorySaleUncheckedUpdateManyInput>;
    /**
     * Filter which HistorySales to update
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * Limit how many HistorySales to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * HistorySale upsert
 */
export type HistorySaleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * The filter to search for the HistorySale to update in case it exists.
     */
    where: Prisma.HistorySaleWhereUniqueInput;
    /**
     * In case the HistorySale found by the `where` argument doesn't exist, create a new HistorySale with this data.
     */
    create: Prisma.XOR<Prisma.HistorySaleCreateInput, Prisma.HistorySaleUncheckedCreateInput>;
    /**
     * In case the HistorySale was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.HistorySaleUpdateInput, Prisma.HistorySaleUncheckedUpdateInput>;
};
/**
 * HistorySale delete
 */
export type HistorySaleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
    /**
     * Filter which HistorySale to delete.
     */
    where: Prisma.HistorySaleWhereUniqueInput;
};
/**
 * HistorySale deleteMany
 */
export type HistorySaleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which HistorySales to delete
     */
    where?: Prisma.HistorySaleWhereInput;
    /**
     * Limit how many HistorySales to delete.
     */
    limit?: number;
};
/**
 * HistorySale without action
 */
export type HistorySaleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorySale
     */
    select?: Prisma.HistorySaleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the HistorySale
     */
    omit?: Prisma.HistorySaleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.HistorySaleInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=HistorySale.d.ts.map